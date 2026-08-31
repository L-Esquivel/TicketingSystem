import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { createTicket } from '../../../lib/tickets';
import { sendNewTicketNotification } from '../../../lib/email';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { CATEGORY_LABELS } from '../../../lib/utils';

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

// POST /api/tickets - Create a new ticket with anti-bot honeypot, rate limiting, and robust validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, requesterName, requesterEmail, category, title, description, priority, website_url } = body;
    const clientIp = getClientIp(request);

    /**
     * ORDER OF EVALUATION EXPLANATION:
     * STEP 1: HONEYPOT CHECK (Evaluated BEFORE Rate Limiter)
     * Rationale: If an automated spambot fills out the hidden honeypot field in bursts,
     * we silently drop its request immediately BEFORE touching the rate limiter store.
     * This prevents a bot attack from exhausting the rate limit quota of a shared IP address
     * (e.g. an office NAT shared by legitimate real estate agents).
     */
    if (website_url && typeof website_url === 'string' && website_url.trim().length > 0) {
      console.warn(`[BOT DETECTED] Honeypot triggered from IP ${clientIp} with value: "${website_url}". Executing silent drop.`);
      
      // Return a simulated success payload so the bot receives no feedback that it was trapped
      return NextResponse.json(
        {
          success: true,
          data: {
            ticketNumber: 'INC-0000',
            requesterName: requesterName || 'Guest User',
            requesterEmail: requesterEmail || 'bot@blocked.local',
            title: title || 'Simulated Incident',
            status: 'OPEN',
            priority: priority || 'MEDIUM',
            createdAt: new Date(),
          },
        },
        { status: 201 }
      );
    }

    /**
     * STEP 2: RATE LIMITING BY IP ADDRESS
     * Allow up to 5 ticket submissions per IP every 10 minutes.
     */
    const rateCheck = checkRateLimit(`ticket-submit:${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Ticket submission limit reached (5 tickets per 10 minutes). Please try again in ${Math.ceil(
            rateCheck.resetMs / 1000
          )} seconds.`,
        },
        { status: 429 }
      );
    }

    /**
     * STEP 3: ROBUST SERVER-SIDE INPUT VALIDATION
     */
    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please select a valid company/business' },
        { status: 400 }
      );
    }

    // Verify company exists in database
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'The selected company does not exist' },
        { status: 404 }
      );
    }

    if (!requesterName || typeof requesterName !== 'string' || requesterName.trim().length < 2 || requesterName.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Requester name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    const cleanEmail = (requesterEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid business email address' },
        { status: 400 }
      );
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const cleanPriority = (priority || 'MEDIUM').toUpperCase();
    if (!validPriorities.includes(cleanPriority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority level specified' },
        { status: 400 }
      );
    }

    const validCategories = Object.keys(CATEGORY_LABELS);
    const cleanCategory = (category || 'GENERAL').toUpperCase();
    if (!validCategories.includes(cleanCategory)) {
      return NextResponse.json(
        { success: false, error: 'Invalid technical category specified' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 150) {
      return NextResponse.json(
        { success: false, error: 'Issue subject/title must be between 5 and 150 characters' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 3000) {
      return NextResponse.json(
        { success: false, error: 'Description must be between 10 and 3000 characters' },
        { status: 400 }
      );
    }

    // STEP 4: ATOMIC TICKET CREATION & NOTIFICATION
    const ticket = await createTicket({
      companyId: company.id,
      requesterName: requesterName.trim(),
      requesterEmail: cleanEmail,
      category: cleanCategory,
      title: title.trim(),
      description: description.trim(),
      priority: cleanPriority,
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
