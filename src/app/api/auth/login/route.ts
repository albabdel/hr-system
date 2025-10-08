import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { signJwt } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password, tenantId } = await req.json();

    if (!email || !password || !tenantId) {
      return NextResponse.json({ error: { message: 'Email, password, and tenant are required' } }, { status: 400 });
    }

    const user = await User.findOne({ 
      email: String(email).toLowerCase(), 
      tenantId: String(tenantId).toLowerCase() 
    }).lean();
    
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const token = signJwt({
      userId: user._id.toString(),
      tenantId: user.tenantId,
      role: user.role,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('vrs_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: { message: 'An internal server error occurred' } }, { status: 500 });
  }
}
