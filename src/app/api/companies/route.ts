import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/companies - List all companies with ticket counts
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Register a new Real Estate company with custom prefix
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, prefix, contactName, contactEmail, contactPhone, address, notes } = body;

    if (!name || !prefix) {
      return NextResponse.json(
        { success: false, error: 'Company name and ticket prefix are required' },
        { status: 400 }
      );
    }

    const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleanPrefix.length < 2 || cleanPrefix.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Prefix must be between 2 and 10 alphanumeric characters' },
        { status: 400 }
      );
    }

    // Check if prefix already exists
    const existing = await prisma.company.findUnique({
      where: { prefix: cleanPrefix },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Prefix "${cleanPrefix}" is already in use by "${existing.name}"` },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        prefix: cleanPrefix,
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim().toLowerCase() || null,
        contactPhone: contactPhone?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        ticketCounter: 0,
      },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register company' },
      { status: 500 }
    );
  }
}
