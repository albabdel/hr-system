import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Employee from "@/models/Employee";
import { getSession } from "@/lib/auth";
import { validate } from "@/lib/validate";
import { EmployeeCreate } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{ message:"Unauthorized" } }, { status:401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const find:any = { tenantId: s.tenantId };
  if (q) find.$or = [
    { firstName: new RegExp(q, "i") },
    { lastName: new RegExp(q, "i") },
    { email: new RegExp(q, "i") },
  ];
  const list = await Employee.find(find).sort({ createdAt:-1 }).limit(50);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = getSession();
  if (!session) return NextResponse.json({ error:{ message:"Unauthorized" } }, { status:401 });

  const v = await validate(req, EmployeeCreate);
  if (!v.ok) return NextResponse.json({ error:{ message:v.error } }, { status:400 });

  const doc = await Employee.create({ ...v.data, tenantId: session.tenantId });
  return NextResponse.json(doc, { status:201 });
}
