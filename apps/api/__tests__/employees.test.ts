import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

async function getAcmeTenantId() {
  const t = await prisma.tenant.findUnique({ where: { slug: 'acme' } });
  if (!t) throw new Error('Seed tenant missing');
  return t.id;
}
function accessToken(userId: string, role: string, tid: string) {
  return jwt.sign({ sub: userId, role, tid, typ: 'access' }, JWT_SECRET, { expiresIn: '10m' });
}

describe('Employees API', () => {
  const { app } = createApp();
  let tid = '';
  beforeAll(async () => { tid = await getAcmeTenantId(); });

  test('List with pagination + search', async () => {
    const token = accessToken('owner', 'HR_ADMIN', tid);
    const page1 = await request(app)
      .get('/v1/employees?limit=5&search=a')
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .expect(200);
    expect(page1.body.items.length).toBeLessThanOrEqual(5);
    if (page1.body.nextCursor) {
      const page2 = await request(app)
        .get(`/v1/employees?limit=5&cursor=${page1.body.nextCursor}&search=a`)
        .set('authorization', `Bearer ${token}`)
        .set('x-tenant-test', tid)
        .expect(200);
      expect(page2.body.items[0].id).not.toBe(page1.body.items[0]?.id);
    }
  });

  test('Create → Read → Update → Delete', async () => {
    const token = accessToken('hr1', 'HR_ADMIN', tid);
    const created = await request(app)
      .post('/v1/employees')
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@acme.test',
        position: 'QA',
        status: 'ACTIVE'
      })
      .expect(201);

    const id = created.body.id as string;

    const read = await request(app)
      .get(`/v1/employees/${id}`)
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .expect(200);
    expect(read.body.email).toBe('test.user@acme.test');

    const updated = await request(app)
      .patch(`/v1/employees/${id}`)
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .send({ position: 'QA Lead' })
      .expect(200);
    expect(updated.body.position).toBe('QA Lead');

    await request(app)
      .delete(`/v1/employees/${id}`)
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .expect(204);
  });

  test('EMPLOYEE cannot create/delete', async () => {
    const token = accessToken('u2', 'EMPLOYEE', tid);
    await request(app)
      .post('/v1/employees')
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .send({
        firstName: 'Block',
        lastName: 'Me',
        email: 'block.me@acme.test'
      })
      .expect(403);

    await request(app)
      .delete('/v1/employees/00000000-0000-0000-0000-000000000000')
      .set('authorization', `Bearer ${token}`)
      .set('x-tenant-test', tid)
      .expect(403);
  });
});
