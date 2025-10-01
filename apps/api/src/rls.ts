import { prisma } from './db.js';

const PROTECTED_TABLES = ['User', 'Department', 'Employee', 'FileObject', 'AuditLog'] as const;

export async function verifyRlsOrExit() {
  // Check that RLS is enabled and at least one policy exists on every table.
  try {
    const rows = await prisma.$queryRaw<Array<{
      tablename: string;
      rls_enabled: boolean;
      rls_forced: boolean;
      policies: number;
    }>>`
      WITH p AS (
        SELECT polrelid::regclass::text AS table_name, count(*) AS policy_count
        FROM pg_policies
        GROUP BY 1
      )
      SELECT
        c.relname AS tablename,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced,
        COALESCE(p.policy_count, 0) AS policies
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN p ON p.table_name = c.relname
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname = ANY(${PROTECTED_TABLES}::text[])
    `;

    const failures = rows.filter(
      (r) => !r.rls_enabled || !r.rls_forced || r.policies < 1,
    );

    if (failures.length > 0) {
      // eslint-disable-next-line no-console
      console.error('RLS misconfiguration detected:', failures);
      process.exit(1);
    }

    // eslint-disable-next-line no-console
    console.log('RLS verified for tables:', PROTECTED_TABLES.join(', '));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to verify RLS:', err);
    process.exit(1);
  }
}
