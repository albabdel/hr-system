
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Interview from "@/models/Interview";
import Application from "@/models/Application";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const s = getSession(); if(!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const list = await Interview.find({ tenantId: s.tenantId, applicationId: params.id }).sort({ when: -1 });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const s = getSession(); if(!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const app = await Application.findOne({ _id: params.id, tenantId: s.tenantId }).lean();
  if (!app) return NextResponse.json({ error:{message:"Application not found"} }, { status:404 });

  const { when, durationMin, type, interviewer, location, notes } = await req.json();
  if (!when) return NextResponse.json({ error:{message:"when required"} }, { status:400 });

  const doc = await Interview.create({
    tenantId: s.tenantId,
    jobId: app.jobId,
    applicationId: app._id,
    when: new Date(when),
    durationMin: durationMin ?? 60,
    type: type ?? "Virtual",
    interviewer, location, notes
  });
  return NextResponse.json(doc, { status: 201 });
}
