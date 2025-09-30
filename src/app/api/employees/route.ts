import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Employee from "@/models/Employee";
import { getSession } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const session = getSession();
  if (!session) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  const list = await Employee.find({ tenantId: session.tenantId }).sort({ createdAt: -1 }).limit(200);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = getSession();
  if (!session) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  const body = await req.json();
  const doc = await Employee.create({ ...body, tenantId: session.tenantId });
  return NextResponse.json(doc, { status: 201 });
}
