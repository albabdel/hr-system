import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import LeaveRequest from "@/models/LeaveRequest";
import { validate } from "@/lib/validate";
import { LeaveRequestCreate } from "@/lib/schemas";

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

  const v = await validate(req, LeaveRequestCreate);
  if (!v.ok) return NextResponse.json({ error:{ message:v.error } }, { status:400 });

  const created = await LeaveRequest.create({ ...v.data, tenantId: s.tenantId });
  return NextResponse.json(created, { status: 201 });
}
