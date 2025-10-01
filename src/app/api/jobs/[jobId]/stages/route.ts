
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Stage from "@/models/Stage";

export async function GET(_: Request, { params }: { params: { jobId: string } }) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const list = await Stage.find({ tenantId: s.tenantId, jobId: params.jobId }).sort({ order: 1 });
  return NextResponse.json(list);
}
