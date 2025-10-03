import { prisma } from '../db.js';

export async function calculatePayslipsForRun(tenantId: string, runId: string) {
  // Very simple calc: base gross 4000; taxes 10%; net 90%.
  // Real logic later (bands, allowances, overtime, leave, etc).
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);

    const run = await tx.payrollRun.findUnique({ where: { id: runId } });
    if (!run) throw new Error('Run not found');

    const emps = await tx.employee.findMany({ where: { status: 'ACTIVE' } });
    let totalGross = 0, totalNet = 0, totalTaxes = 0;

    for (const e of emps) {
      const gross = 4000;
      const taxes = Math.round(gross * 0.10 * 100) / 100;
      const net = gross - taxes;

      await tx.payslip.create({
        data: {
          tenantId,
          runId: run.id,
          employeeId: e.id,
          currency: 'USD',
          gross,
          taxes,
          net
        }
      });

      totalGross += gross;
      totalTaxes += taxes;
      totalNet += net;
    }

    await tx.payrollRun.update({
      where: { id: run.id },
      data: { totals: { totalGross, totalTaxes, totalNet } }
    });
  });
}
