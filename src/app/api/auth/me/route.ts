import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, data: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}
