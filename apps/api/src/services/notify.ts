
import axios from 'axios';
import nodemailer from 'nodemailer';
import { prisma } from '../db.js';

const isTest = process.env.NODE_ENV === 'test';

export async function getIntegration(tenantId: string, type: 'SLACK_WEBHOOK'|'TEAMS_WEBHOOK'|'SMTP') {
  return prisma.integration.findUnique({ where: { tenantId_type: { tenantId, type } } });
}

export async function saveIntegration(tenantId: string, type: 'SLACK_WEBHOOK'|'TEAMS_WEBHOOK'|'SMTP', name: string, config: any) {
  return prisma.integration.upsert({
    where: { tenantId_type: { tenantId, type } },
    create: { tenantId, type, name, config },
    update: { name, config, isEnabled: true }
  });
}

export async function logNotif(tenantId: string, channel: 'SLACK'|'TEAMS'|'EMAIL', data: Partial<{
  status: 'QUEUED'|'SENT'|'FAILED',
  target: string|null,
  subject: string|null,
  body: string|null,
  error: string|null,
  attempts: number,
  deliveredAt: Date|null
}>) {
  return prisma.notificationLog.create({
    data: {
      tenantId,
      channel,
      status: (data.status || 'QUEUED') as any,
      target: data.target || null,
      subject: data.subject || null,
      body: data.body || null,
      error: data.error || null,
      attempts: data.attempts ?? 0,
      deliveredAt: data.deliveredAt || null
    }
  });
}

export async function sendSlack(tenantId: string, text: string) {
  const i = await getIntegration(tenantId, 'SLACK_WEBHOOK');
  if (!i?.isEnabled) throw new Error('Slack not configured');
  if (isTest) return { ok: true };
  await axios.post(String((i.config as any).webhookUrl), { text });
  return { ok: true };
}

export async function sendTeams(tenantId: string, text: string) {
  const i = await getIntegration(tenantId, 'TEAMS_WEBHOOK');
  if (!i?.isEnabled) throw new Error('Teams not configured');
  if (isTest) return { ok: true };
  await axios.post(String((i.config as any).webhookUrl), { text: text });
  return { ok: true };
}

export async function sendEmail(tenantId: string, to: string, subject: string, body: string) {
  const i = await getIntegration(tenantId, 'SMTP');
  const cfg = (i?.config || {}) as any;
  if (!i?.isEnabled && !isTest) throw new Error('SMTP not configured');

  if (isTest) return { ok: true };

  const transporter = nodemailer.createTransport({
    host: cfg.host || process.env.SMTP_HOST || 'localhost',
    port: Number(cfg.port || process.env.SMTP_PORT || 1025),
    secure: Boolean(cfg.secure || false),
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined
  });

  await transporter.sendMail({
    from: `"${cfg.fromName || 'HR'}" <${cfg.fromEmail || 'hr@example.com'}>`,
    to,
    subject,
    text: body
  });
  return { ok: true };
}
