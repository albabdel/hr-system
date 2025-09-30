import { dbConnect } from "@/lib/db";
import Employee from "@/models/Employee";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = getSession();
  if (!session) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  const body = await req.json();
  const doc = await Employee.findOneAndUpdate(
    { _id: params.id, tenantId: session.tenantId }, body, { new: true }
  );
  if (!doc) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = getSession();
  if (!session) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  await Employee.deleteOne({ _id: params.id, tenantId: session.tenantId });
  return NextResponse.json({ ok: true });
}
