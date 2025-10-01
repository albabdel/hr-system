import { prisma } from '../src/db.js';
import crypto from 'crypto';

// Simple helper to create a deterministic demo password hash placeholder.
// Auth will replace this in Stage 4.
function hashDemoPassword(password: string) {
  // Not for production auth. Placeholder until JWT auth lands.
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  // Upsert tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    create: { name: 'Acme Inc', slug: 'acme' },
    update: {},
  });

  // Upsert OWNER user
  const owner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@acme.test' } },
    create: {
      tenantId: tenant.id,
      email: 'owner@acme.test',
      name: 'Acme Owner',
      role: 'OWNER',
      passwordHash: hashDemoPassword('owner123'),
    },
    update: {},
  });

  // Departments
  const eng = await prisma.department.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Engineering' } },
    create: { tenantId: tenant.id, name: 'Engineering', code: 'ENG' },
    update: {},
  });

  const hr = await prisma.department.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'HR' } },
    create: { tenantId: tenant.id, name: 'HR', code: 'HR' },
    update: {},
  });

  // Employees
  const firstNames = ['Alice','Bob','Carol','David','Eve','Frank','Grace','Heidi','Ivan','Judy'];
  const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Garcia','Rodriguez','Wilson'];

  for (let i = 0; i < 10; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@acme.test`;

    await prisma.employee.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      create: {
        tenantId: tenant.id,
        firstName: first,
        lastName: last,
        email,
        position: i % 2 === 0 ? 'Engineer' : 'HR Specialist',
        departmentId: i % 2 === 0 ? eng.id : hr.id,
        status: 'ACTIVE',
      },
      update: {},
    });
  }

  // One sample file object for demo
  await prisma.fileObject.upsert({
    where: { tenantId_bucket_objectKey: { tenantId: tenant.id, bucket: 'hr-dev', objectKey: 'welcome.pdf' } },
    create: {
      tenantId: tenant.id,
      bucket: 'hr-dev',
      objectKey: 'welcome.pdf',
      sizeBytes: 1024,
      contentType: 'application/pdf',
    },
    update: {}
  });

  // One audit log example
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorUserId: owner.id,
      entity: 'Seed',
      entityId: tenant.id,
      action: 'SEED_COMPLETE',
      after: { message: 'Initial demo data seeded' },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', { tenant: tenant.slug, owner: owner.email });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
