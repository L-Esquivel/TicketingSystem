import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getCurrentUser, verifyPassword, hashPassword, createSessionToken } from '../../../../lib/auth';
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Rate limiting by IP address to prevent brute-force attacks on current password
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`change-password:${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password change attempts. Please try again in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Authentication check
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password, new password, and confirmation are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    // 3. Verify user in database
    const dbUser = await prisma.adminUser.findUnique({
      where: { id: sessionUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isCurrentValid = await verifyPassword(currentPassword, dbUser.password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect current password' },
        { status: 400 }
      );
    }

    // 4. Update password and remove mustChangePassword flag
    const hashedNewPassword = await hashPassword(newPassword);
    const updatedUser = await prisma.adminUser.update({
      where: { id: dbUser.id },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
      },
    });

    // 5. Issue fresh session cookie without mustChangePassword flag
    const newSessionUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mustChangePassword: false,
    };

    const newToken = await createSessionToken(newSessionUser);
    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully! Dashboard access unlocked.',
      data: newSessionUser,
    });

    response.cookies.set('auth_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
