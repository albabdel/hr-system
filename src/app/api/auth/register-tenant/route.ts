import { dbConnect } from "@/lib/db";
import Tenant from "@/models/Tenant";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const { tenantSlug, tenantName, adminEmail, adminPassword } = body;
  if (!tenantSlug || !tenantName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: { message: "Missing fields" } }, { status: 400 });
  }

  const _id = String(tenantSlug).toLowerCase();
  const existing = await Tenant.findById(_id).lean();
  if (existing) {
    return NextResponse.json({ error: { message: "Tenant exists" } }, { status: 409 });
  }

  await Tenant.create({ _id, name: tenantName, setupComplete: false, theme: { primary: "#ffda47" } });
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const user = await User.create({
    tenantId: _id,
    email: String(adminEmail).toLowerCase(),
    name: "Admin",
    passwordHash,
    role: "OWNER",
  });

  const token = signJwt({ userId: String(user._id), tenantId: _id, role: "OWNER" });
  const res = NextResponse.json({ ok: true, tenantId: _id });
  res.cookies.set("vrs_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return res;
}
