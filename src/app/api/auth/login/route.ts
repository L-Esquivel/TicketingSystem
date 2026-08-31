import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa email y contraseña' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas (usuario no encontrado)' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: `¡Bienvenido de nuevo, ${user.name}!`,
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
      { success: false, error: error.message || 'Error durante el inicio de sesión' },
      { status: 500 }
    );
  }
}
