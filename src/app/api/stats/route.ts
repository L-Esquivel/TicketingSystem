import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const filter: any = {};
    if (companyId && companyId !== 'ALL') {
      filter.companyId = companyId;
    }

    const [
      total,
      open,
      inProgress,
      waiting,
      resolved,
      closed,
      critical,
      high,
      medium,
      low,
      companies,
      recentActivity,
    ] = await Promise.all([
      prisma.ticket.count({ where: filter }),
      prisma.ticket.count({ where: { ...filter, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...filter, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...filter, status: 'WAITING' } }),
      prisma.ticket.count({ where: { ...filter, status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { ...filter, status: 'CLOSED' } }),
      prisma.ticket.count({ where: { ...filter, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...filter, priority: 'HIGH', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...filter, priority: 'MEDIUM', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...filter, priority: 'LOW', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.company.findMany({
        select: {
          id: true,
          name: true,
          prefix: true,
          tickets: {
            select: { status: true },
          },
        },
      }),
      prisma.ticketHistory.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          ticket: {
            select: {
              ticketNumber: true,
              title: true,
              company: { select: { name: true, prefix: true } },
            },
          },
        },
      }),
    ]);

    const byCompany = companies.map((c) => ({
      companyId: c.id,
      companyName: c.name,
      companyPrefix: c.prefix,
      count: c.tickets.length,
      openCount: c.tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING').length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        waiting,
        resolved,
        closed,
        critical,
        high,
        medium,
        low,
        byCompany,
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error al calcular estadísticas' },
      { status: 500 }
    );
  }
}
