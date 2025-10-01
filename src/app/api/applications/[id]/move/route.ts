
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Application from "@/models/Application";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const s = getSession(); if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const { toStageKey } = await req.json();
  const doc = await Application.findOneAndUpdate(
    { _id: params.id, tenantId: s.tenantId },
    { $set: { stageKey: toStageKey } },
    { new: true }
  ).populate("candidateId", "firstName lastName email source");
  if (!doc) return NextResponse.json({ error:{message:"Not found"} }, { status:404 });
  return NextResponse.json(doc);
}
