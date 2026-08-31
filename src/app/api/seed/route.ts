import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const count = await prisma.company.count();
    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: 'La base de datos ya contiene información.',
      });
    }

    // 1. Create Real Estate Companies
    const apex = await prisma.company.create({
      data: {
        name: 'Apex Realty Group',
        prefix: 'APEX',
        contactName: 'Sarah Jenkins',
        contactEmail: 'sjenkins@apexrealtygroup.com',
        contactPhone: '+1 (310) 555-0142',
        address: '9454 Wilshire Blvd, Beverly Hills, CA',
        notes: 'Luxury residential and commercial brokerage with 45 agents.',
        ticketCounter: 3,
      },
    });

    const sunset = await prisma.company.create({
      data: {
        name: 'Sunset Bay Properties',
        prefix: 'SUNSET',
        contactName: 'Carlos Ramirez',
        contactEmail: 'cramirez@sunsetbayprop.com',
        contactPhone: '+1 (305) 555-0199',
        address: '1200 Brickell Ave, Miami, FL',
        notes: 'Waterfront condominium management and vacation rental operations.',
        ticketCounter: 2,
      },
    });

    const metro = await prisma.company.create({
      data: {
        name: 'Metro Living Real Estate',
        prefix: 'METRO',
        contactName: 'David Chen',
        contactEmail: 'dchen@metrolivingre.com',
        contactPhone: '+1 (512) 555-0187',
        address: '500 W 2nd St, Austin, TX',
        notes: 'Urban multi-family leasing and property development.',
        ticketCounter: 1,
      },
    });

    // 2. Create Initial Sample Tickets
    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'SUNSET-0001',
        companyId: sunset.id,
        requesterName: 'Carlos Ramirez',
        requesterEmail: 'cramirez@sunsetbayprop.com',
        category: 'NETWORK',
        title: 'Main Office Cisco switch offline - Miami Beach leasing center disconnected',
        description: 'The entire 2nd floor leasing center lost internet connectivity after the morning power surge.',
        priority: 'CRITICAL',
        status: 'OPEN',
        assignedTo: 'IT Support Team',
      },
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: t1.id,
        action: 'CREATED',
        actor: 'Carlos Ramirez',
        details: 'Incidencia reportada con prioridad CRÍTICA.',
      },
    });

    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'APEX-0001',
        companyId: apex.id,
        requesterName: 'Sarah Jenkins',
        requesterEmail: 'sjenkins@apexrealtygroup.com',
        category: 'MLS_REALTY',
        title: 'MLS / CRMLS Single Sign-On sync failure for 12 commercial agents',
        description: 'Agents attempting to log into CRMLS via our Okta SSO dashboard are receiving error code SAML-403.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: 'Luis (IT Lead)',
      },
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: t2.id,
        action: 'CREATED',
        actor: 'Sarah Jenkins',
        details: 'Incidencia creada con prioridad ALTA.',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Base de datos poblada exitosamente con datos de prueba de Real Estate.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
