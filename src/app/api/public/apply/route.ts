
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Candidate from "@/models/Candidate";
import Application from "@/models/Application";
import Stage from "@/models/Stage";
import Job from "@/models/Job";

const buckets: Record<string,{ts:number,count:number}> = {};

function rl(key: string, limit=5, windowMs=60_000) {
  const now = Date.now(); const w = buckets[key];
  if (!w || now - w.ts > windowMs) { buckets[key] = { ts: now, count: 1 }; return true; }
  if (w.count >= limit) return false; w.count++; return true;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const ip = req.headers.get("x-forwarded-for") || "ip";
  if (!rl(`apply:${ip}`)) return NextResponse.json({ error:{message:"Too many requests"} }, { status:429 });

  const body = await req.json();
  const { tenantId, jobId, firstName, lastName, email, phone, resumeUrl, source } = body || {};
  if (!tenantId || !jobId || !firstName || !lastName || !email)
    return NextResponse.json({ error:{message:"Missing fields"} }, { status:400 });

  const job = await Job.findOne({ _id: jobId, tenantId, status:"OPEN", isPublic: true });
  if (!job) return NextResponse.json({ error:{message:"Job not found"} }, { status:404 });

  const cand = await Candidate.findOneAndUpdate(
    { tenantId, email: email.toLowerCase() },
    { $set: { firstName, lastName, phone, resumeUrl, source: source || "Careers Site" } },
    { new: true, upsert: true }
  );

  const firstStage = await Stage.findOne({ tenantId, jobId }).sort({ order: 1 }).lean();
  const stageKey = firstStage?.key || "SOURCED";

  const app = await Application.create({
    tenantId, jobId, candidateId: cand._id, stageKey
  });

  return NextResponse.json({ ok:true, applicationId: app._id });
}
