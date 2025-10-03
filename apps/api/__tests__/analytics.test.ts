import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
function token(sub: string, role: string, tid: string) {
  return jwt.sign({ sub, role, tid, typ: 'access' }, JWT_SECRET, { expiresIn: '10m' });
}

async function tidAndUser() {
  const t = await prisma.tenant.findUnique({ where: { slug: 'acme' } });
  if (!t) throw new Error('seed tenant missing');
  const u = await prisma.user.findFirst({ where: { tenantId: t.id } });
  if (!u) throw new Error('seed user missing');
  return { tid: t.id, uid: u.id };
}

describe('Analytics', () => {
  const { app } = createApp();
  let tid = '', uid = '';
  beforeAll(async () => { const v = await tidAndUser(); tid = v.tid; uid = v.uid; });

  test('headcount series returns data', async () => {
    const tok = token(uid, 'HR_ADMIN', tid);
    await request(app).post('/v1/analytics/refresh').set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid).expect(200);
    const r = await request(app).get('/v1/analytics/headcount').set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid).expect(200);
    expect(Array.isArray(r.body.series)).toBe(true);
  });

  test('create export job and poll', async () => {
    const tok = token(uid, 'HR_ADMIN', tid);
    const start = await request(app).post('/v1/analytics/exports').set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid).send({ type: 'headcount' }).expect(200);
    const jobId = start.body.jobId;
    expect(jobId).toBeTruthy();
    const poll = await request(app).get(`/v1/analytics/exports/${jobId}`).set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid).expect(200);
    expect(poll.body.status).toBeDefined();
  });
});
