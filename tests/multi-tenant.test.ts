import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../src/lib/prisma';
import { GET as getTicketsHandler } from '../src/app/api/tickets/route';
import { createTicket } from '../src/lib/tickets';

describe('Multi-Tenant API Route Handlers Isolation', () => {
  let companyAId: string;
  let companyBId: string;
  let ticketA: any;
  let ticketB: any;

  beforeEach(async () => {
    // Wipe test database and seed fresh multi-tenant records
    await prisma.ticketHistory.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.company.deleteMany({});

    const companyA = await prisma.company.create({
      data: { name: 'Alpha Realty', prefix: 'ALPHA', ticketCounter: 0 },
    });
    const companyB = await prisma.company.create({
      data: { name: 'Beta Properties', prefix: 'BETA', ticketCounter: 0 },
    });

    companyAId = companyA.id;
    companyBId = companyB.id;

    ticketA = await createTicket({
      companyId: companyAId,
      requesterName: 'Alice Alpha',
      requesterEmail: 'alice@alpha.com',
      title: 'Alpha Specific Issue',
      description: 'Description for Alpha Realty ticket',
    });

    ticketB = await createTicket({
      companyId: companyBId,
      requesterName: 'Bob Beta',
      requesterEmail: 'bob@beta.com',
      title: 'Beta Specific Issue',
      description: 'Description for Beta Properties ticket',
    });
  });

  it('should strictly isolate tickets for Company A when GET /api/tickets?companyId=companyAId is requested', async () => {
    const req = new Request(`http://localhost:3000/api/tickets?companyId=${companyAId}`);
    const res = await getTicketsHandler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].ticketNumber).toBe(ticketA.ticketNumber);
    expect(body.data[0].companyId).toBe(companyAId);

    // Confirm Company B ticket is NOT returned
    const containsCompanyBTicket = body.data.some((t: any) => t.id === ticketB.id);
    expect(containsCompanyBTicket).toBe(false);
  });

  it('should strictly isolate tickets for Company B when GET /api/tickets?companyId=companyBId is requested', async () => {
    const req = new Request(`http://localhost:3000/api/tickets?companyId=${companyBId}`);
    const res = await getTicketsHandler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].ticketNumber).toBe(ticketB.ticketNumber);
    expect(body.data[0].companyId).toBe(companyBId);

    // Confirm Company A ticket is NOT returned
    const containsCompanyATicket = body.data.some((t: any) => t.id === ticketA.id);
    expect(containsCompanyATicket).toBe(false);
  });

  it('should return tickets across ALL companies when no companyId param is provided (Global Staff View)', async () => {
    const req = new Request('http://localhost:3000/api/tickets');
    const res = await getTicketsHandler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(2);

    const ticketNumbers = body.data.map((t: any) => t.ticketNumber);
    expect(ticketNumbers).toContain(ticketA.ticketNumber);
    expect(ticketNumbers).toContain(ticketB.ticketNumber);
  });
});
