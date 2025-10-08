import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
import { NextResponse, NextRequest } from "next/server";
import { resolveTenantId } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  await dbConnect();
  
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: { message: "Email and password are required" } }, { status: 400 });
  }

  const host = req.headers.get("host") || undefined;
  const headerTenant = req.headers.get("x-tenant-id")?.toLowerCase() || undefined;
  const tenantId = resolveTenantId(host, headerTenant);
  
  if (!tenantId) {
    return NextResponse.json({ error: { message: "Tenant ID could not be resolved." } }, { status: 400 });
  }

  const user = await User.findOne({ tenantId, email: String(email).toLowerCase() }).lean();
  if (!user?.passwordHash) {
    return NextResponse.json({ error:{message:"Invalid credentials"} }, { status:401 });
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return NextResponse.json({ error:{message:"Invalid credentials"} }, { status:401 });

  const token = signJwt({ userId: String(user._id), tenantId, role: user.role || "EMPLOYEE" });
  const res = NextResponse.json({ ok:true });
  res.cookies.set("vrs_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
