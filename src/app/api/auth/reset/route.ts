import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const passLuis = await bcrypt.hash('admin123', 10);
    const passBoss = await bcrypt.hash('boss123', 10);

    // Force reset passwords for default accounts
    await prisma.adminUser.upsert({
      where: { email: 'luis@propdeskit.com' },
      update: { password: passLuis, role: 'SUPER_ADMIN' },
      create: {
        name: 'Luis Esquivel',
        email: 'luis@propdeskit.com',
        password: passLuis,
        role: 'SUPER_ADMIN',
      },
    });

    await prisma.adminUser.upsert({
      where: { email: 'boss@propdeskit.com' },
      update: { password: passBoss, role: 'EXECUTIVE' },
      create: {
        name: 'Managing Director (Boss)',
        email: 'boss@propdeskit.com',
        password: passBoss,
        role: 'EXECUTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Passwords successfully reset to admin123 (for luis@propdeskit.com) and boss123 (for boss@propdeskit.com)',
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
