
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import Job from "@/models/Job";
import Stage from "@/models/Stage";

export async function GET(req: NextRequest) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "OPEN";
  const jobs = await Job.find({ tenantId: s.tenantId, status }).sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  requireRole(s, ["OWNER","HR_ADMIN","MANAGER"]);
  const body = await req.json();
  const job = await Job.create({ tenantId: s.tenantId, ...body });
  const defaults = [
    { key:"SOURCED", name:"Sourced" },
    { key:"SCREEN", name:"Phone Screen" },
    { key:"INTERVIEW", name:"Interview" },
    { key:"OFFER", name:"Offer" },
    { key:"HIRED", name:"Hired" },
    { key:"REJECTED", name:"Rejected" },
  ];
  await Stage.insertMany(defaults.map((st, i)=>({ tenantId: s.tenantId, jobId: job._id, key: st.key, name: st.name, order: i })));
  return NextResponse.json(job, { status: 201 });
}
