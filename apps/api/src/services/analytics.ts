import { prisma } from '../db.js';

export async function headcountSeries(tenantId: string, from?: Date, to?: Date, groupBy: 'day'|'month' = 'day') {
  if (!from) from = new Date(Date.now() - 90*24*3600*1000);
  if (!to) to = new Date();
  const rows = await prisma.$queryRawUnsafe<Array<{ day: Date; active_count: number }>>(
    `SELECT day, active_count
     FROM mv_headcount_daily
     WHERE tenant_id = $1 AND day BETWEEN $2::date AND $3::date
     ORDER BY day ASC`,
     tenantId, from, to
  );
  if (groupBy === 'month') {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = new Date(Date.UTC(r.day.getUTCFullYear(), r.day.getUTCMonth(), 1)).toISOString().slice(0,10);
      map.set(key, (map.get(key) || 0) + Number(r.active_count));
    }
    return Array.from(map.entries()).map(([period, value]) => ({ period, value }));
  }
  return rows.map(r => ({ period: r.day.toISOString().slice(0,10), value: Number(r.active_count) }));
}

export async function payrollCostSeries(tenantId: string, from?: Date, to?: Date) {
  if (!from) from = new Date(Date.now() - 365*24*3600*1000);
  if (!to) to = new Date();
  const rows = await prisma.$queryRawUnsafe<Array<{ month: Date; net_total: any; gross_total: any; tax_total: any }>>(
    `SELECT month, net_total, gross_total, tax_total
     FROM mv_payroll_cost_monthly
     WHERE tenant_id = $1 AND month BETWEEN date_trunc('month',$2::timestamp) AND date_trunc('month',$3::timestamp)
     ORDER BY month ASC`,
     tenantId, from, to
  );
  return rows.map(r => ({
    period: r.month.toISOString().slice(0,10),
    net: Number(r.net_total),
    gross: Number(r.gross_total),
    taxes: Number(r.tax_total)
  }));
}
