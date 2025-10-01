/**
 * Smoke test for RLS behavior using direct SQL.
 * Run with: pnpm --filter @hr/api rls:smoke
 */
import { prisma } from '../src/db.js';

async function getTenantIdBySlug(slug: string): Promise<string> {
  const t = await prisma.tenant.findUnique({ where: { slug } });
  if (!t) throw new Error(`Tenant not found: ${slug}`);
  return t.id;
}

async function setTenantId(tenantId: string) {
  // Set per-session config. This must be set in each DB session.
  await prisma.$executeRawUnsafe(
    `SELECT set_config('app.tenant_id', $1, true)`,
    tenantId,
  );
}

async function run() {
  const acmeId = await getTenantIdBySlug('acme');

  // 1) Same-tenant read
  await setTenantId(acmeId);
  const sameTenantEmployees = await prisma.employee.findMany({ take: 3 });
  if (sameTenantEmployees.length === 0) {
    throw new Error('Expected same-tenant read to return rows');
  }

  // 2) Cross-tenant read should return zero rows.
  // Create a fake other tenant row to test filter (temporary table approach).
  // Instead, we assert that adding a WHERE for a different tenant returns 0.
  const crossRead = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "Employee" WHERE "tenantId" <> $1 LIMIT 1`,
    acmeId,
  );
  if (Array.isArray(crossRead) && crossRead.length > 0) {
    throw new Error('Cross-tenant read unexpectedly returned rows');
  }

  // 3) Cross-tenant write should be blocked by RLS.
  let writeBlocked = false;
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Employee" SET "position" = 'Hacker' WHERE "tenantId" <> $1`,
      acmeId,
    );
  } catch (e) {
    // Expect: ERROR:  new row violates row-level security policy for table "Employee"
    writeBlocked = true;
  }
  if (!writeBlocked) {
    throw new Error('Expected cross-tenant write to be blocked by RLS');
  }

  // eslint-disable-next-line no-console
  console.log('RLS smoke passed: same-tenant read ok, cross-tenant blocked.');
}

run()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('RLS smoke failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
