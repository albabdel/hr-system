
import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse } from '../errors.js';
import { SlackWebhookUpsert, TeamsWebhookUpsert, SmtpUpsert, TestNotify } from '../schemas/integrations.js';
import { prisma } from '../db.js';
import { registry } from '../openapi.js';
import { saveIntegration, sendSlack, sendTeams, sendEmail, logNotif } from '../services/notify.js';

const router = Router();

registry.registerPath({ method: 'get', path: '/v1/integrations', tags: ['integrations'], responses: { 200: { description: 'OK' } } });
router.get('/', tenantResolver, requireAuth, rbacGuard(Action.INTEGRATION_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!;
  const items = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.integration.findMany({ orderBy: { createdAt: 'desc' } });
  });
  res.json(items);
});

registry.registerPath({
  method: 'post', path: '/v1/integrations/slack-webhook', tags: ['integrations'],
  request: { body: { content: { 'application/json': { schema: SlackWebhookUpsert } } } }, responses: { 200: { description: 'OK' } }
});
router.post('/slack-webhook', tenantResolver, requireAuth, rbacGuard(Action.INTEGRATION_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!; const b = zParse(SlackWebhookUpsert)(req.body);
  const row = await saveIntegration(tenantId, 'SLACK_WEBHOOK', b.name, { webhookUrl: b.webhookUrl });
  res.json(row);
});

registry.registerPath({
  method: 'post', path: '/v1/integrations/teams-webhook', tags: ['integrations'],
  request: { body: { content: { 'application/json': { schema: TeamsWebhookUpsert } } } }, responses: { 200: { description: 'OK' } }
});
router.post('/teams-webhook', tenantResolver, requireAuth, rbacGuard(Action.INTEGRATION_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!; const b = zParse(TeamsWebhookUpsert)(req.body);
  const row = await saveIntegration(tenantId, 'TEAMS_WEBHOOK', b.name, { webhookUrl: b.webhookUrl });
  res.json(row);
});

registry.registerPath({
  method: 'post', path: '/v1/integrations/smtp', tags: ['integrations'],
  request: { body: { content: { 'application/json': { schema: SmtpUpsert } } } }, responses: { 200: { description: 'OK' } }
});
router.post('/smtp', tenantResolver, requireAuth, rbacGuard(Action.INTEGRATION_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!; const b = zParse(SmtpUpsert)(req.body);
  const row = await saveIntegration(tenantId, 'SMTP', b.name, b);
  res.json(row);
});

registry.registerPath({
  method: 'post', path: '/v1/integrations/test', tags: ['integrations'],
  request: { body: { content: { 'application/json': { schema: TestNotify } } } }, responses: { 200: { description: 'OK' } }
});
router.post('/test', tenantResolver, requireAuth, rbacGuard(Action.INTEGRATION_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!; const b = zParse(TestNotify)(req.body);
  const results: any[] = [];

  for (const ch of b.channels) {
    try {
      if (ch === 'SLACK') {
        await sendSlack(tenantId, 'Test notification from HR SaaS');
        await logNotif(tenantId, 'SLACK', { status: 'SENT', target: 'slack', subject: 'Test', body: 'ok', attempts: 1, deliveredAt: new Date() });
        results.push({ channel: ch, ok: true });
      } else if (ch === 'TEAMS') {
        await sendTeams(tenantId, 'Test notification from HR SaaS');
        await logNotif(tenantId, 'TEAMS', { status: 'SENT', target: 'teams', subject: 'Test', body: 'ok', attempts: 1, deliveredAt: new Date() });
        results.push({ channel: ch, ok: true });
      } else if (ch === 'EMAIL') {
        const to = b.emailTo || 'test@example.com';
        await sendEmail(tenantId, to, 'Test Notification', 'Hello from HR SaaS');
        await logNotif(tenantId, 'EMAIL', { status: 'SENT', target: to, subject: 'Test Notification', body: 'Hello', attempts: 1, deliveredAt: new Date() });
        results.push({ channel: ch, ok: true });
      }
    } catch (e: any) {
      await logNotif(tenantId, ch as any, { status: 'FAILED', target: ch.toLowerCase(), error: e.message, attempts: 1 });
      results.push({ channel: ch, ok: false, error: e.message });
    }
  }

  res.json({ results });
});

export default router;
