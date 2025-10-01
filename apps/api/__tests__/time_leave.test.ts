import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function accessToken(sub: string, role: string, tid: string) {
  return jwt.sign({ sub, role, tid, typ: 'access' }, JWT_SECRET, { expiresIn: '10m' });
}

async function seedUserTid() {
  const t = await prisma.tenant.findUnique({ where: { slug: 'acme' } });
  if (!t) throw new Error('Missing seed tenant');
  // pick the first user
  const u = await prisma.user.findFirst({ where: { tenantId: t.id } });
  if (!u) throw new Error('Missing user');
  return { tid: t.id, uid: u.id };
}

describe('Time & Leave', () => {
  const { app } = createApp();
  let tid = ''; let uid = '';
  beforeAll(async () => {
    const v = await seedUserTid(); tid = v.tid; uid = v.uid;
  });

  test('clock in/out and list', async () => {
    const token = accessToken(uid, 'EMPLOYEE', tid);
    await request(app).post('/v1/time/clock/in').set('authorization', `Bearer ${token}`).set('x-tenant-test', tid).expect(200);
    await request(app).post('/v1/time/clock/out').set('authorization', `Bearer ${token}`).set('x-tenant-test', tid).expect(200);
    const list = await request(app).get('/v1/time/clock/me').set('authorization', `Bearer ${token}`).set('x-tenant-test', tid).expect(200);
    expect(Array.isArray(list.body.items)).toBe(true);
  });

  test('leave request flow: create -> approve -> list', async () => {
    const hr = accessToken('hr', 'HR_ADMIN', tid);
    // create leave type
    const lt = await request(app).post('/v1/leave/types').set('authorization', `Bearer ${hr}`).set('x-tenant-test', tid).send({ name:'Annual', code:'ANNUAL', daysPerYear:20 }).expect(201);

    const emp = accessToken(uid, 'EMPLOYEE', tid);
    // create request
    const today = new Date(); const d1 = today.toISOString().slice(0,10); const d2 = d1;
    const lr = await request(app).post('/v1/leave/requests').set('authorization', `Bearer ${emp}`).set('x-tenant-test', tid)
      .send({ typeId: lt.body.id, startDate: d1, endDate: d2 }).expect(201);

    // approve as HR
    await request(app).post(`/v1/leave/requests/${lr.body.id}/approve`).set('authorization', `Bearer ${hr}`).set('x-tenant-test', tid).expect(200);

    // list by status
    const list = await request(app).get('/v1/leave/requests?status=APPROVED').set('authorization', `Bearer ${hr}`).set('x-tenant-test', tid).expect(200);
    expect(list.body.find((x:any)=>x.id===lr.body.id)?.status).toBe('APPROVED');
  });

  test('employee cannot manage leave types or holidays', async () => {
    const emp = accessToken(uid, 'EMPLOYEE', tid);
    await request(app).post('/v1/leave/types').set('authorization', `Bearer ${emp}`).set('x-tenant-test', tid).send({ name:'Sick', code:'SICK' }).expect(403);
    await request(app).post('/v1/holidays').set('authorization', `Bearer ${emp}`).set('x-tenant-test', tid).send({ date: '2025-12-25', name:'X' }).expect(403);
  });
});
