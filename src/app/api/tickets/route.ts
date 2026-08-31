import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { createTicket } from '../../../lib/tickets';
import { sendNewTicketNotification } from '../../../lib/email';

export const dynamic = 'force-dynamic';

// GET /api/tickets - List all tickets with rich filtering and search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    const where: any = {};

    if (companyId && companyId !== 'ALL') {
      where.companyId = companyId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (q && q.trim() !== '') {
      const query = q.trim();
      where.OR = [
        { ticketNumber: { contains: query } },
        { title: { contains: query } },
        { description: { contains: query } },
        { requesterName: { contains: query } },
        { requesterEmail: { contains: query } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            prefix: true,
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    console.error('Error listing tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket with automatic sequence generation and email notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, requesterName, requesterEmail, category, title, description, priority } = body;

    if (!companyId || !requesterName || !requesterEmail || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company, Requester Name, Email, Title, and Description are required',
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requesterEmail)) {
      return NextResponse.json(
        { success: false, error: 'The provided email address is invalid' },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      companyId,
      requesterName,
      requesterEmail,
      category: category || 'GENERAL',
      title,
      description,
      priority: priority || 'MEDIUM',
    });

    // Send email alert to IT Lead / Admin in background
    if (ticket.company) {
      sendNewTicketNotification({
        ticket,
        company: ticket.company,
      }).catch((emailErr) => {
        console.error('Failed to trigger email notification:', emailErr);
      });
    }

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
