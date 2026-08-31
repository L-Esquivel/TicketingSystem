import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Real Estate IT Support...');

  // Clean existing data
  await prisma.ticketHistory.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.company.deleteMany({});

  // 1. Create Real Estate Companies with custom prefixes
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
      ticketCounter: 2,
    },
  });

  const hcrest = await prisma.company.create({
    data: {
      name: 'Highland Crest Realty',
      prefix: 'HCREST',
      contactName: 'Elena Rostova',
      contactEmail: 'elena@highlandcrestrealty.com',
      contactPhone: '+1 (303) 555-0164',
      address: '1700 Lincoln St, Denver, CO',
      notes: 'Mountain and luxury residential property specialists.',
      ticketCounter: 1,
    },
  });

  console.log('✅ Real Estate Companies created with custom prefixes.');

  // 2. Create Realistic IT Support Tickets
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1000 * 60 * 60);
  const threeHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 3);
  const oneDayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const twoDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 48);

  // Ticket 1 (Critical, Open)
  const t1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'SUNSET-0001',
      companyId: sunset.id,
      requesterName: 'Carlos Ramirez',
      requesterEmail: 'cramirez@sunsetbayprop.com',
      category: 'NETWORK',
      title: 'Main Office Cisco switch offline - Miami Beach leasing center disconnected',
      description: 'The entire 2nd floor leasing center lost internet connectivity after the morning power surge. Access points are blinking orange and agents cannot access the MLS or CRM.',
      priority: 'CRITICAL',
      status: 'OPEN',
      assignedTo: 'IT Support Team',
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t1.id,
      action: 'CREATED',
      actor: 'Carlos Ramirez',
      details: 'Incidencia reportada con prioridad CRÍTICA debido a corte total de red.',
      createdAt: oneHourAgo,
    },
  });

  // Ticket 2 (High, In Progress)
  const t2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'APEX-0001',
      companyId: apex.id,
      requesterName: 'Sarah Jenkins',
      requesterEmail: 'sjenkins@apexrealtygroup.com',
      category: 'MLS_REALTY',
      title: 'MLS / CRMLS Single Sign-On sync failure for 12 commercial agents',
      description: 'Agents attempting to log into CRMLS via our Okta SSO dashboard are receiving error code SAML-403 Invalid Audience Restriction. Need this resolved before the 2 PM listing presentation.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Luis (IT Lead)',
      internalNotes: 'Contacted CRMLS tech support identity provider endpoint to refresh X.509 certificate.',
      createdAt: threeHoursAgo,
      updatedAt: oneHourAgo,
    },
  });

  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: t2.id,
        action: 'CREATED',
        actor: 'Sarah Jenkins',
        details: 'Incidencia creada con prioridad ALTA.',
        createdAt: threeHoursAgo,
      },
      {
        ticketId: t2.id,
        action: 'STATUS_CHANGED',
        actor: 'Luis (IT Lead)',
        details: 'Estado cambiado a EN PROGRESO. Asignado a Luis (IT Lead).',
        createdAt: oneHourAgo,
      },
    ],
  });

  // Ticket 3 (Medium, Waiting on Customer)
  const t3 = await prisma.ticket.create({
    data: {
      ticketNumber: 'SUNSET-0002',
      companyId: sunset.id,
      requesterName: 'Maria Delgado',
      requesterEmail: 'mdelgado@sunsetbayprop.com',
      category: 'SOFTWARE',
      title: 'DocuSign API webhook synchronization error with Yardi Property Management',
      description: 'Executed tenant leases signed via DocuSign are not automatically attaching to the tenant records inside Yardi Voyager.',
      priority: 'MEDIUM',
      status: 'WAITING',
      assignedTo: 'IT Support Team',
      internalNotes: 'Waiting for Maria to provide the transaction envelope ID of the failed contract.',
      createdAt: oneDayAgo,
      updatedAt: threeHoursAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t3.id,
      action: 'CREATED',
      actor: 'Maria Delgado',
      details: 'Incidencia registrada en categoría SOFTWARE.',
      createdAt: oneDayAgo,
    },
  });

  // Ticket 4 (High, Resolved)
  const t4 = await prisma.ticket.create({
    data: {
      ticketNumber: 'METRO-0001',
      companyId: metro.id,
      requesterName: 'David Chen',
      requesterEmail: 'dchen@metrolivingre.com',
      category: 'SECURITY',
      title: 'Targeted phishing email received by accounting impersonating Managing Broker',
      description: 'Accounting received an email claiming to be from the managing broker requesting a wire transfer change for Escrow #8841. Flagged as urgent security concern.',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignedTo: 'Luis (IT Lead)',
      resolutionNotes: 'Quarantined the phishing email across all Microsoft 365 mailboxes, blocked the sender domain in Defender for Office 365, and initiated password resets as a precaution.',
      internalNotes: 'No escrow funds were compromised. Tenant and client escrow accounts remain secure.',
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo,
      resolvedAt: oneDayAgo,
    },
  });

  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: t4.id,
        action: 'CREATED',
        actor: 'David Chen',
        details: 'Incidencia creada con prioridad ALTA.',
        createdAt: twoDaysAgo,
      },
      {
        ticketId: t4.id,
        action: 'RESOLVED',
        actor: 'Luis (IT Lead)',
        details: 'Incidencia resuelta. Dominio malicioso bloqueado en Defender.',
        createdAt: oneDayAgo,
      },
    ],
  });

  // Ticket 5 (Medium, Open)
  const t5 = await prisma.ticket.create({
    data: {
      ticketNumber: 'HCREST-0001',
      companyId: hcrest.id,
      requesterName: 'Elena Rostova',
      requesterEmail: 'elena@highlandcrestrealty.com',
      category: 'HARDWARE',
      title: 'New Realtor Laptop Onboarding & BitLocker Encryption configuration',
      description: 'New associate broker Marcus Vance starting next Monday. Need standard MacBook Pro configured with Microsoft 365, MLS tools, VPN client, and full disk encryption.',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'IT Support Team',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t5.id,
      action: 'CREATED',
      actor: 'Elena Rostova',
      details: 'Incidencia registrada para configuración de equipo.',
      createdAt: twoDaysAgo,
    },
  });

  // Ticket 6 (Low, Resolved)
  const t6 = await prisma.ticket.create({
    data: {
      ticketNumber: 'APEX-0002',
      companyId: apex.id,
      requesterName: 'Robert Vance',
      requesterEmail: 'rvance@apexrealtygroup.com',
      category: 'ACCESS',
      title: 'Requesting permission to Shared Dropbox "Q3 Marketing Media & Video Tours"',
      description: 'Robert needs read/write permissions to upload 4K drone footage for the new Bel Air estate listing.',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedTo: 'Luis (IT Lead)',
      resolutionNotes: 'Added robert@apexrealtygroup.com to the Marketing-Media Dropbox Team folder with Editor role.',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
      resolvedAt: twoDaysAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t6.id,
      action: 'CREATED',
      actor: 'Robert Vance',
      details: 'Incidencia registrada para solicitud de accesos.',
      createdAt: twoDaysAgo,
    },
  });

  // Ticket 7 (Low, Closed)
  const t7 = await prisma.ticket.create({
    data: {
      ticketNumber: 'APEX-0003',
      companyId: apex.id,
      requesterName: 'Amanda Lewis',
      requesterEmail: 'alewis@apexrealtygroup.com',
      category: 'PRINTER_PERIPHERALS',
      title: 'Conference room color plotter printing faint lines on architectural blueprints',
      description: 'The HP DesignJet in Conference Room B is leaving cyan streaks across layout plans.',
      priority: 'LOW',
      status: 'CLOSED',
      assignedTo: 'Luis (IT Lead)',
      resolutionNotes: 'Replaced printhead cartridge and performed alignment calibration.',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
      resolvedAt: twoDaysAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t7.id,
      action: 'CREATED',
      actor: 'Amanda Lewis',
      details: 'Incidencia creada.',
      createdAt: twoDaysAgo,
    },
  });

  console.log('✅ 7 Realistic IT Support tickets created across Real Estate businesses.');
  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
