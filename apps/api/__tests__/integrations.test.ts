
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

describe('Integrations', () => {
  const { app } = createApp();
  let tid = '', uid = '';
  beforeAll(async () => { const v = await setup(); tid = v.tid; uid = v.uid; });

  test('save slack/teams/smtp and send test', async () => {
    const tok = token(uid, 'HR_ADMIN', tid);

    await request(app).post('/v1/integrations/slack-webhook')
      .set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid)
      .send({ webhookUrl: 'http://example.com/slack', name: 'Slack' }).expect(200);

    await request(app).post('/v1/integrations/teams-webhook')
      .set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid)
      .send({ webhookUrl: 'http://example.com/teams', name: 'Teams' }).expect(200);

    await request(app).post('/v1/integrations/smtp')
      .set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid)
      .send({ name: 'SMTP', host: 'localhost', port: 1025, secure: false, fromEmail: 'no-reply@example.com', fromName: 'HR' })
      .expect(200);

    const r = await request(app).post('/v1/integrations/test')
      .set('authorization', `Bearer ${tok}`).set('x-tenant-test', tid)
      .send({ channels: ['SLACK','TEAMS','EMAIL'], emailTo: 'dev@example.com' }).expect(200);

    expect(Array.isArray(r.body.results)).toBe(true);
  });
});
