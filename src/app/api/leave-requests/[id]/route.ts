import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import LeaveRequest from "@/models/LeaveRequest";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const { action, note } = await req.json(); // APPROVE | REJECT | CANCEL

  const allowedManagerActions = ["OWNER","HR_ADMIN","MANAGER"];
  if (action === "APPROVE" || action === "REJECT") requireRole(s, allowedManagerActions as any);

  const statusMap: any = { APPROVE: "APPROVED", REJECT: "REJECTED", CANCEL: "CANCELLED" };
  const nextStatus = statusMap[action];
  if (!nextStatus) return NextResponse.json({ error:{message:"Invalid action"} }, { status:400 });

  const doc = await LeaveRequest.findOneAndUpdate(
    { _id: params.id, tenantId: s.tenantId, ...(action==="CANCEL"?{}:{ status: "PENDING" }) },
    { $set: { status: nextStatus, approverUserId: s.userId, decisionNote: note || "" } },
    { new: true }
  );
  if (!doc) return NextResponse.json({ error:{message:"Not found or not allowed"} }, { status:404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  await LeaveRequest.deleteOne({ _id: params.id, tenantId: s.tenantId, status: "PENDING" });
  return NextResponse.json({ ok: true });
}
