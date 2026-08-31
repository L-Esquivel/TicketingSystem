import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { hashPassword, getCurrentUser } from '../../../../lib/auth';

interface Params {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

// GET /api/users/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user info & password reset
export async function PUT(request: Request, { params }: Params) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    const current = await prisma.adminUser.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== current.email) {
        const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
        if (existing) {
          return NextResponse.json(
            { success: false, error: `Email "${cleanEmail}" is already used by another user` },
            { status: 409 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    if (role) {
      const validRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'TECHNICIAN'];
      if (validRoles.includes(role)) {
        // Prevent demoting the last super admin
        if (current.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
          const superAdminCount = await prisma.adminUser.count({ where: { role: 'SUPER_ADMIN' } });
          if (superAdminCount <= 1) {
            return NextResponse.json(
              { success: false, error: 'Cannot change the role of the only remaining Super Admin' },
              { status: 400 }
            );
          }
        }
        updateData.role = role;
      }
    }

    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateData.password = await hashPassword(password.trim());
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Safety lock: Cannot delete self
    if (sessionUser.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'Security safeguard: You cannot delete your own logged-in account' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.adminUser.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Safety lock: Cannot delete last SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.adminUser.count({ where: { role: 'SUPER_ADMIN' } });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the only remaining Super Admin in the system' },
          { status: 400 }
        );
      }
    }

    await prisma.adminUser.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
