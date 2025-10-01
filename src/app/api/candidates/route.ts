
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Candidate from "@/models/Candidate";

export async function GET(req: NextRequest) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const q = (new URL(req.url)).searchParams.get("q") || "";
  const find:any = { tenantId: s.tenantId };
  if (q) find.$or = [{ firstName: new RegExp(q,"i") }, { lastName: new RegExp(q,"i") }, { email: new RegExp(q,"i") }];
  const list = await Candidate.find(find).sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const body = await req.json();
  const doc = await Candidate.create({ tenantId: s.tenantId, ...body });
  return NextResponse.json(doc, { status: 201 });
}
