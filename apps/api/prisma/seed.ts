import { prisma } from '../src/db.js';
import crypto from 'crypto';

function hashDemoPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    create: { name: 'Acme Inc', slug: 'acme' },
    update: {},
  });

  const owner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@acme.test' } },
    create: {
      tenantId: tenant.id, email: 'owner@acme.test', name: 'Acme Owner',
      role: 'OWNER', passwordHash: hashDemoPassword('owner123'),
    },
    update: {},
  });

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

  const firstNames = ['Alice','Bob','Carol','David','Eve','Frank','Grace','Heidi','Ivan','Judy','Karl','Lena','Mia','Nate','Omar','Pia','Quinn','Ruth','Sami','Tia'];
  const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Garcia','Rodriguez','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Martinez'];

  for (let i = 0; i < 40; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@acme.test`;

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

  await prisma.fileObject.upsert({
    where: { tenantId_bucket_objectKey: { tenantId: tenant.id, bucket: 'hr-dev', objectKey: 'welcome.pdf' } },
    create: { tenantId: tenant.id, bucket: 'hr-dev', objectKey: 'welcome.pdf', sizeBytes: 1024, contentType: 'application/pdf' },
    update: {},
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id, actorUserId: owner.id,
      entity: 'Seed', entityId: tenant.id, action: 'SEED_COMPLETE',
      after: { message: 'Initial demo data seeded (employees=40)' },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', { tenant: tenant.slug, owner: owner.email });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
