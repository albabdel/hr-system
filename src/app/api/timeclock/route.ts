import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import TimeClock from "@/models/TimeClock";

export async function GET() {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });

  const rows = await TimeClock
    .find({ tenantId: s.tenantId })
    .sort({ inAt: -1 })
    .limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const { employeeId, action, notes } = await req.json(); // action: "IN" | "OUT"

  if (action === "IN") {
    const open = await TimeClock.findOne({ tenantId: s.tenantId, employeeId, outAt: { $exists: false } });
    if (open) return NextResponse.json({ error:{message:"Already clocked in"} }, { status:409 });
    const created = await TimeClock.create({ tenantId: s.tenantId, employeeId, inAt: new Date(), source: "web", notes });
    return NextResponse.json(created, { status: 201 });
  }

  if (action === "OUT") {
    const open = await TimeClock.findOne({ tenantId: s.tenantId, employeeId, outAt: { $exists: false } }).sort({ inAt: -1 });
    if (!open) return NextResponse.json({ error:{message:"No active session"} }, { status:404 });
    open.outAt = new Date(); if (notes) open.notes = notes;
    await open.save();
    return NextResponse.json(open);
  }

  return NextResponse.json({ error:{message:"Invalid action"} }, { status:400 });
}
