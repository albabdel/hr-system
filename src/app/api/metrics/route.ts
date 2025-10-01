import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Employee from "@/models/Employee";
import LeaveRequest from "@/models/LeaveRequest";
import TimeClock from "@/models/TimeClock";

export async function GET() {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });

  const [headcount, pendingLeave, openClocks] = await Promise.all([
    Employee.countDocuments({ tenantId: s.tenantId }),
    LeaveRequest.countDocuments({ tenantId: s.tenantId, status: "PENDING" }),
    TimeClock.countDocuments({ tenantId: s.tenantId, outAt: { $exists: false } }),
  ]);

  return NextResponse.json({ headcount, pendingLeave, openClocks });
}
