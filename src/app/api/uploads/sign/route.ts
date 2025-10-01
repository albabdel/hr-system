import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { signPutUrl, BUCKET } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const s = getSession();
  if (!s) return NextResponse.json({ error:{message:"Unauthorized"} }, { status:401 });
  const { filename, contentType } = await req.json();
  if (!filename || !contentType) return NextResponse.json({ error:{message:"Missing fields"} }, { status:400 });

  const key = `${s.tenantId}/docs/${Date.now()}_${filename.replace(/\s+/g,"_")}`;
  const url = await signPutUrl(key, contentType);
  const publicUrl = `${process.env.S3_ENDPOINT?.replace(/\/$/,"")}/${BUCKET}/${key}`;
  return NextResponse.json({ url, key, publicUrl });
}
