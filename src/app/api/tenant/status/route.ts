import { NextResponse, NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Tenant from "@/models/Tenant";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{ message:"Unauthorized" } }, { status: 401 });
  const t = await Tenant.findById(s.tenantId).lean();
  if (!t) return NextResponse.json({ error:{ message:"Tenant not found" } }, { status: 404 });
  return NextResponse.json({ setupComplete: !!t.setupComplete, theme: t.theme, name: t.name });
}
