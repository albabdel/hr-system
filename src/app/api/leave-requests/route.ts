import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import LeaveRequest from "@/models/LeaveRequest";

export async function GET(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // optional
  const q: any = { tenantId: s.tenantId };
  if (status) q.status = status;

  const list = await LeaveRequest
    .find(q)
    .populate("employeeId", "firstName lastName email position department")
    .sort({ createdAt: -1 })
    .limit(200);

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });

  const body = await req.json();
  // expected: { employeeId, typeCode, startDate, endDate, reason }
  if (!body.employeeId || !body.typeCode || !body.startDate || !body.endDate)
    return NextResponse.json({ error:{message:"Missing fields"} }, { status:400 });

  const created = await LeaveRequest.create({
    tenantId: s.tenantId,
    employeeId: body.employeeId,
    typeCode: body.typeCode,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    reason: body.reason || ""
  });
  return NextResponse.json(created, { status: 201 });
}
