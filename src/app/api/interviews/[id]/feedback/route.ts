
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Interview from "@/models/Interview";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const s = getSession(); if(!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const { feedback, outcome } = await req.json();
  const doc = await Interview.findOneAndUpdate(
    { _id: params.id, tenantId: s.tenantId },
    { $set: { feedback: feedback ?? "", outcome: outcome ?? "PENDING" } },
    { new: true }
  );
  if (!doc) return NextResponse.json({ error:{message:"Not found"} }, { status:404 });
  return NextResponse.json(doc);
}
