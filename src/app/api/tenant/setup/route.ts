import { NextResponse, NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Tenant from "@/models/Tenant";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await dbConnect();
  const s = getSession();
  if (!s) return NextResponse.json({ error:{ message:"Unauthorized" } }, { status: 401 });

  const body = await req.json(); // { name?, theme?: {logoUrl?, primary?} }
  const t = await Tenant.findOneAndUpdate(
    { _id: s.tenantId },
    { $set: { ...(body?.name?{name:body.name}:{}) , ...(body?.theme?{theme: body.theme}:{}) , setupComplete: true } },
    { new: true }
  );
  return NextResponse.json({ ok: true, setupComplete: !!t?.setupComplete });
}
