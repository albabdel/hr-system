import dbConnect from '@/lib/db';
import Tenant from '@/models/Tenant';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { signJwt } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { tenantSlug, tenantName, adminEmail, adminPassword } = body;

    if (!tenantSlug || !tenantName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: { message: 'Missing required fields' } }, { status: 400 });
    }

    const tenantId = String(tenantSlug).toLowerCase().trim();
    if (!/^[a-z0-9-]{3,30}$/.test(tenantId)) {
        return NextResponse.json({ error: { message: 'Tenant ID must be 3-30 lowercase letters, numbers, or hyphens.' } }, { status: 400 });
    }

    const existingTenant = await Tenant.findById(tenantId);
    if (existingTenant) {
      return NextResponse.json({ error: { message: 'Tenant with this ID already exists.' } }, { status: 409 });
    }

    const existingUser = await User.findOne({ email: String(adminEmail).toLowerCase() });
    if (existingUser) {
        return NextResponse.json({ error: { message: 'An account with this email already exists.' } }, { status: 409 });
    }

    const newTenant = await Tenant.create({
      _id: tenantId,
      name: tenantName,
      setupComplete: false,
      theme: { primary: '#FFDA47' }
    });

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const newUser = await User.create({
      tenantId,
      email: String(adminEmail).toLowerCase(),
      name: 'Admin',
      passwordHash,
      role: 'OWNER',
    });

    const token = signJwt({
      userId: newUser._id.toString(),
      tenantId: newTenant._id,
      role: newUser.role,
    });

    const response = NextResponse.json({ ok: true, tenantId: newTenant._id });
    response.cookies.set('vrs_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: { message: 'An internal server error occurred.' } }, { status: 500 });
  }
}
