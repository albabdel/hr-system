import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const TENANT_ID = '00000000-0000-0000-0000-00000000test';

function token(sub: string, role: string) {
  return jwt.sign({ sub, tid: TENANT_ID, role, typ: 'access' }, JWT_SECRET, { expiresIn: '10m' });
}

describe('RBAC probe', () => {
  const { app } = createApp();
  const base = request(app);

  test('EMPLOYEE can read self, not others', async () => {
    const me = token('user-self', 'EMPLOYEE');
    const ok = await base.get(`/v1/probe/employee/user-self`)
      .set('authorization', `Bearer ${me}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(200);
    expect(ok.body.ok).toBe(true);

    await base.get(`/v1/probe/employee/another`)
      .set('authorization', `Bearer ${me}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(403);
  });

  test('MANAGER can read tenant but cannot create/delete employees', async () => {
    const mgr = token('manager-1', 'MANAGER');
    await base.get(`/v1/probe/employee/someone`)
      .set('authorization', `Bearer ${mgr}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(200);

    await base.post(`/v1/probe/employee`)
      .set('authorization', `Bearer ${mgr}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(403);

    await base.delete(`/v1/probe/employee/123`)
      .set('authorization', `Bearer ${mgr}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(403);
  });

  test('HR_ADMIN can create/delete employees', async () => {
    const hr = token('hr-1', 'HR_ADMIN');
    await base.post(`/v1/probe/employee`)
      .set('authorization', `Bearer ${hr}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(201);

    await base.delete(`/v1/probe/employee/123`)
      .set('authorization', `Bearer ${hr}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(204);
  });

  test('OWNER allowed on all actions', async () => {
    const owner = token('owner-1', 'OWNER');
    await base.get(`/v1/probe/employee/any`)
      .set('authorization', `Bearer ${owner}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(200);

    await base.post(`/v1/probe/employee`)
      .set('authorization', `Bearer ${owner}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(201);

    await base.delete(`/v1/probe/employee/any`)
      .set('authorization', `Bearer ${owner}`)
      .set('x-tenant-test', TENANT_ID)
      .expect(204);
  });
});
