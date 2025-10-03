import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function token(sub: string, role: string, tid: string) {
  return jwt.sign({ sub, role, tid, typ: 'access' }, JWT_SECRET, { expiresIn: '10m' });
}

async function seed() {
  const t = await prisma.tenant.findUnique({ where: { slug: 'acme' } });
  if (!t) throw new Error('seed tenant missing');
  const u = await prisma.user.findFirst({ where: { tenantId: t.id } });
  if (!u) throw new Error('seed user missing');
  return { tid: t.id, uid: u.id };
}

describe('Billing', () => {
  const { app } = createApp();
  let tid = '', uid = '';
  beforeAll(async () => { const v = await seed(); tid = v.tid; uid = v.uid; });

  test('checkout session returns URL (test stub)', async () => {
    const tok = token(uid, 'HR_ADMIN', tid);
    const r = await request(app)
      .post('/v1/billing/checkout/session')
      .set('authorization', `Bearer ${tok}`)
      .set('x-tenant-test', tid)
      .send({ plan: 'PRO', seats: 3 })
      .expect(200);
    expect(r.body.url).toMatch(/^http/);
  });

  test('webhook provision -> subscription visible -> seat sync', async () => {
    // simulate Stripe checkout.session.completed webhook
    const payload = {
      type: 'checkout.session.completed',
      data: { object: { metadata: { tenantId: tid, plan: 'PRO', seats: '5' }, customer: 'cus_test', subscription: 'sub_test' } }
    };
    await request(app).post('/webhooks/stripe').send(payload).expect(200);

    const admin = token(uid, 'OWNER', tid);
    const sub = await request(app)
      .get('/v1/billing/subscription')
      .set('authorization', `Bearer ${admin}`)
      .set('x-tenant-test', tid)
      .expect(200);
    expect(sub.body.plan).toBe('PRO');
    expect(sub.body.status).toBe('ACTIVE');

    const ss = await request(app)
      .post('/v1/billing/seat-sync')
      .set('authorization', `Bearer ${admin}`)
      .set('x-tenant-test', tid)
      .expect(200);
    expect(ss.body.seatCount).toBeGreaterThan(0);
  });
});
