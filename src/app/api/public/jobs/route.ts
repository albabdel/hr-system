
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Job from "@/models/Job";
import Stage from "@/models/Stage";

export async function GET(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenant");
  if (!tenantId) return NextResponse.json({ error:{message:"tenant required"} }, { status:400 });

  const jobs = await Job.find({ tenantId, status:"OPEN", isPublic: true })
    .select("_id title department location createdAt")
    .sort({ createdAt: -1 }).lean();

  // also return stage keys for client to know first stage
  if (jobs.length > 0) {
    const stage = await Stage.findOne({ tenantId, jobId: jobs[0]?._id }).sort({ order: 1 }).select("key").lean(); // optional
    return NextResponse.json({ jobs, defaultStageKey: stage?.key || "SOURCED" });
  }
  
  return NextResponse.json({ jobs, defaultStageKey: "SOURCED" });
}
