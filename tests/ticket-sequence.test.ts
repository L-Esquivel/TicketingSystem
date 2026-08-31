import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../src/lib/prisma';
import { createTicket } from '../src/lib/tickets';

describe('Atomic Ticket Sequence Generation', () => {
  let apexCompanyId: string;
  let sunsetCompanyId: string;

  beforeEach(async () => {
    // Clean tables and create fresh test companies
    await prisma.ticketHistory.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.company.deleteMany({});

    const apex = await prisma.company.create({
      data: { name: 'Apex Realty', prefix: 'APEX', ticketCounter: 0 },
    });
    const sunset = await prisma.company.create({
      data: { name: 'Sunset Properties', prefix: 'SUNSET', ticketCounter: 0 },
    });

    apexCompanyId = apex.id;
    sunsetCompanyId = sunset.id;
  });

  it('should generate sequential ticket numbers formatted with company prefix', async () => {
    const t1 = await createTicket({
      companyId: apexCompanyId,
      requesterName: 'Agent One',
      requesterEmail: 'agent1@apex.com',
      title: 'Issue 1',
      description: 'Test description 1 for Apex',
    });

    const t2 = await createTicket({
      companyId: apexCompanyId,
      requesterName: 'Agent Two',
      requesterEmail: 'agent2@apex.com',
      title: 'Issue 2',
      description: 'Test description 2 for Apex',
    });

    expect(t1.ticketNumber).toBe('APEX-0001');
    expect(t2.ticketNumber).toBe('APEX-0002');
  });

  it('should handle concurrent creations across TWO distinct companies in parallel with isolated counters', async () => {
    // Create 5 Apex tickets and 5 Sunset tickets concurrently in parallel
    const apexPromises = Array.from({ length: 5 }, (_, i) =>
      createTicket({
        companyId: apexCompanyId,
        requesterName: `Apex Agent ${i + 1}`,
        requesterEmail: `apex${i + 1}@realty.com`,
        title: `Parallel Apex Issue ${i + 1}`,
        description: `Parallel test description for Apex ${i + 1}`,
      })
    );

    const sunsetPromises = Array.from({ length: 5 }, (_, i) =>
      createTicket({
        companyId: sunsetCompanyId,
        requesterName: `Sunset Agent ${i + 1}`,
        requesterEmail: `sunset${i + 1}@properties.com`,
        title: `Parallel Sunset Issue ${i + 1}`,
        description: `Parallel test description for Sunset ${i + 1}`,
      })
    );

    const [apexResults, sunsetResults] = await Promise.all([
      Promise.all(apexPromises),
      Promise.all(sunsetPromises),
    ]);

    // Verify Apex ticket numbers (APEX-0001 through APEX-0005)
    const apexNumbers = apexResults.map((t) => t.ticketNumber).sort();
    expect(apexNumbers).toEqual([
      'APEX-0001',
      'APEX-0002',
      'APEX-0003',
      'APEX-0004',
      'APEX-0005',
    ]);

    // Verify Sunset ticket numbers (SUNSET-0001 through SUNSET-0005)
    const sunsetNumbers = sunsetResults.map((t) => t.ticketNumber).sort();
    expect(sunsetNumbers).toEqual([
      'SUNSET-0001',
      'SUNSET-0002',
      'SUNSET-0003',
      'SUNSET-0004',
      'SUNSET-0005',
    ]);

    // Verify counters in DB
    const finalApex = await prisma.company.findUnique({ where: { id: apexCompanyId } });
    const finalSunset = await prisma.company.findUnique({ where: { id: sunsetCompanyId } });

    expect(finalApex?.ticketCounter).toBe(5);
    expect(finalSunset?.ticketCounter).toBe(5);
  });
});
