import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyPassword, createSessionToken, hashPassword } from '../../../../lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Auto-bootstrap operator initial admin user if database is fresh/empty
    const totalUsers = await prisma.adminUser.count();
    if (totalUsers === 0) {
      const initialEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@propdeskit.com';
      const initialName = process.env.INITIAL_ADMIN_NAME || 'Super Administrator';
      const rawInitialPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex') + 'A1!';

      const hashedInitialPassword = await hashPassword(rawInitialPassword);

      await prisma.adminUser.create({
        data: {
          name: initialName,
          email: initialEmail.trim().toLowerCase(),
          password: hashedInitialPassword,
          role: 'SUPER_ADMIN',
          mustChangePassword: true,
        },
      });

      console.warn(`
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ [SECURITY NOTICE] INITIAL SUPER ADMIN ACCOUNT CREATED                    │
│                                                                             │
│ Email:    ${initialEmail.padEnd(58)} │
│ Status:   MUST CHANGE PASSWORD ON FIRST LOGIN                              │
│                                                                             │
│ Please change your password immediately upon first dashboard login.         │
└─────────────────────────────────────────────────────────────────────────────┘
      `);
    }

    // Check if user exists
    const user = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials (user not found)' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: sessionUser,
    });

    // Set HTTP-only Cookie
    response.cookies.set('auth_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error during login' },
      { status: 500 }
    );
  }
}
