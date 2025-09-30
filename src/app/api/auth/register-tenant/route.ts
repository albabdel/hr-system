import { dbConnect } from "@/lib/db";
import Tenant from "@/models/Tenant";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { tenantSlug, tenantName, adminEmail, adminPassword } = await req.json();

  if (!tenantSlug || !tenantName || !adminEmail || !adminPassword)
    return NextResponse.json({ error: { message: "Missing fields" } }, { status: 400 });

  const exists = await Tenant.findById(tenantSlug);
  if (exists) return NextResponse.json({ error: { message: "Tenant exists" } }, { status: 409 });

  await Tenant.create({ _id: tenantSlug, name: tenantName });
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await User.create({
    tenantId: tenantSlug,
    email: adminEmail.toLowerCase(),
    name: "Admin",
    passwordHash,
    role: "OWNER",
  });

  const token = signJwt({ userId: String(admin._id), tenantId: tenantSlug, role: "OWNER" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("vrs_token", token, { httpOnly: true, path: "/", sameSite: "lax" });
  return res;
}
