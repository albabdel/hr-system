import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = getSession();
  if (!s) return NextResponse.json({ ok:false }, { status:401 });
  return NextResponse.json({ ok:true, user: { role: s.role, tenantId: s.tenantId, email: "" } });
}
