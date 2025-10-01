import { NextResponse, NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Tenant from "@/models/Tenant";
import { getSession } from "@/lib/auth";
import { resolveTenantId } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  await dbConnect();
  const s = getSession();

  // If there's a session, use its tenantId
  if (s) {
    const t = await Tenant.findById(s.tenantId).lean();
    if (!t) return NextResponse.json({ error:{ message:"Tenant not found" } }, { status: 404 });
    return NextResponse.json({ setupComplete: !!t.setupComplete, theme: t.theme, name: t.name });
  }
  
  // If no session, resolve tenant from host for public pages like login
  const host = req.headers.get("host") || undefined;
  const tenantId = resolveTenantId(host);
  const t = await Tenant.findById(tenantId).lean();
  
  // On public pages, we don't know if setup is complete, but we can send theme data
  if (t) {
    return NextResponse.json({ setupComplete: false, theme: t.theme, name: t.name });
  }

  // Fallback for when tenant doesn't exist yet (e.g., on the registration page)
  return NextResponse.json({ setupComplete: false, theme: {}, name: "" });
}
