import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import Employee from "@/models/Employee";
import { EmployeeBulk } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  requireRole(s, ["OWNER","HR_ADMIN"]);

  const body = await req.json().catch(()=>null);
  const parsed = EmployeeBulk.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error:{message: parsed.error.issues.map(i=>`${i.path.join(".")}: ${i.message}`).join("; ")} }, { status:400 });
  }
  const rows = parsed.data;

  // Map managerEmail -> managerId
  const managers = new Map<string, string>();
  const mgrEmails = Array.from(new Set(rows.map(r=>r.managerEmail).filter(Boolean))) as string[];
  if (mgrEmails.length) {
    const mgrs = await Employee.find({ tenantId: s.tenantId, email: { $in: mgrEmails } }, { _id:1, email:1 }).lean();
    mgrs.forEach(m => managers.set((m.email as string).toLowerCase(), String(m._id)));
  }

  const docs = rows.map(r => ({
    tenantId: s.tenantId,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email?.toLowerCase(),
    department: r.department,
    position: r.position,
    hireDate: r.hireDate ? new Date(r.hireDate) : undefined,
    managerId: r.managerEmail ? managers.get(r.managerEmail.toLowerCase()) : undefined,
  }));

  // Upsert on email if present, else insert
  const ops = docs.map(d => d.email
    ? ({ updateOne: { filter: { tenantId: s.tenantId, email: d.email }, update: { $set: d }, upsert: true }})
    : ({ insertOne: { document: d }}));
  const res = await Employee.bulkWrite(ops, { ordered: false });

  return NextResponse.json({ ok:true, upserted: res.upsertedCount, modified: res.modifiedCount, inserted: res.insertedCount, n: rows.length });
}
