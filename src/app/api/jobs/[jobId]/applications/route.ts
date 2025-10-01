
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Application from "@/models/Application";

export async function GET(_: NextRequest, { params }: { params: { jobId: string } }) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const apps = await Application
    .find({ tenantId: s.tenantId, jobId: params.jobId })
    .populate("candidateId", "firstName lastName email source")
    .sort({ createdAt: -1 });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const body = await req.json(); // { candidateId, stageKey, notes? }
  const doc = await Application.create({ tenantId: s.tenantId, jobId: params.jobId, ...body });
  return NextResponse.json(doc, { status: 201 });
}
