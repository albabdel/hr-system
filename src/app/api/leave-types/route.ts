import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import LeaveType from "@/models/LeaveType";

export async function GET() {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const list = await LeaveType.find({ tenantId: s.tenantId }).sort({ name: 1 });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  requireRole(s, ["OWNER","HR_ADMIN"]);
  const body = await req.json();
  const doc = await LeaveType.create({ ...body, tenantId: s.tenantId });
  return NextResponse.json(doc, { status: 201 });
}
