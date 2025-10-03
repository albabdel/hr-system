
import { z } from 'zod';
import { registry } from '../openapi.js';

export const SlackWebhookUpsert = z.object({
  name: z.string().min(2).default('Slack Webhook'),
  webhookUrl: z.string().url()
});

export const TeamsWebhookUpsert = z.object({
  name: z.string().min(2).default('Teams Webhook'),
  webhookUrl: z.string().url()
});

export const SmtpUpsert = z.object({
  name: z.string().min(2).default('SMTP'),
  host: z.string(),
  port: z.number().int().min(1),
  secure: z.boolean().default(false),
  user: z.string().optional(),
  pass: z.string().optional(),
  fromEmail: z.string().email(),
  fromName: z.string().min(1)
});

export const TestNotify = z.object({
  channels: z.array(z.enum(['SLACK','TEAMS','EMAIL'])).nonempty(),
  emailTo: z.string().email().optional()
});

registry.register('SlackWebhookUpsert', SlackWebhookUpsert);
registry.register('TeamsWebhookUpsert', TeamsWebhookUpsert);
registry.register('SmtpUpsert', SmtpUpsert);
registry.register('TestNotify', TestNotify);
