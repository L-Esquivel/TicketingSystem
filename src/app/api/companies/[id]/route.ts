import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

// GET /api/companies/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        tickets: {
          orderBy: { createdAt: 'desc' },
          include: { history: true },
        },
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const { name, prefix, contactName, contactEmail, contactPhone, address, notes } = body;

    const current = await prisma.company.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    let cleanPrefix = current.prefix;
    if (prefix && prefix !== current.prefix) {
      cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const existing = await prisma.company.findUnique({ where: { prefix: cleanPrefix } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { success: false, error: `Prefix "${cleanPrefix}" is already in use by another company` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.company.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : undefined,
        prefix: cleanPrefix,
        contactName: contactName !== undefined ? contactName?.trim() : undefined,
        contactEmail: contactEmail !== undefined ? contactEmail?.trim().toLowerCase() : undefined,
        contactPhone: contactPhone !== undefined ? contactPhone?.trim() : undefined,
        address: address !== undefined ? address?.trim() : undefined,
        notes: notes !== undefined ? notes?.trim() : undefined,
      },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update company' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    await prisma.company.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Company deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
