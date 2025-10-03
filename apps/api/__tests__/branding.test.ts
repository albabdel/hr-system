import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function token(sub: string, role: string, tid: string) {
  return jwt.sign({ sub, role, tid, typ: 'access' }, JWT_SECRET, { expiresIn: '10m' });
}

async function setup() {
  const t = await prisma.tenant.findUnique({ where: { slug: 'acme' } });
  if (!t) throw new Error('seed tenant missing');
  const u = await prisma.user.findFirst({ where: { tenantId: t.id } });
  if (!u) throw new Error('seed user missing');
  return { tid: t.id, uid: u.id };
}

describe('Branding', () => {
  const { app } = createApp();
  let tid = '', uid = '';
  beforeAll(async () => { const v = await setup(); tid = v.tid; uid = v.uid; });

  test('get default branding', async () => {
    const tok = token(uid, 'HR_ADMIN', tid);
    const r = await request(app).get('/v1/branding')
      .set('authorization', `Bearer ${tok}`)
      .set('x-tenant-test', tid)
      .expect(200);
    expect(r.body.brandName).toBeTruthy();
  });

  test('update branding', async () => {
    const tok = token(uid, 'OWNER', tid);
    const r = await request(app).put('/v1/branding')
      .set('authorization', `Bearer ${tok}`)
      .set('x-tenant-test', tid)
      .send({
        brandName: 'Acme HR',
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#2563eb',
        accentColor: '#f59e0b',
        sidebarBg: '#ffffff',
        sidebarText: '#111827',
        scheme: 'LIGHT'
      })
      .expect(200);
    expect(r.body.brandName).toBe('Acme HR');
  });
});
