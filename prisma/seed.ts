import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Real Estate IT Support with Auth...');

  // Clean existing data
  await prisma.ticketHistory.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.adminUser.deleteMany({});

  // 1. Create Admin Accounts (Luis & Boss)
  const passwordLuis = await bcrypt.hash('admin123', 10);
  const passwordBoss = await bcrypt.hash('boss123', 10);

  const luis = await prisma.adminUser.create({
    data: {
      name: 'Luis Esquivel',
      email: 'luis@propdeskit.com',
      password: passwordLuis,
      role: 'SUPER_ADMIN',
    },
  });

  const boss = await prisma.adminUser.create({
    data: {
      name: 'Managing Director (Boss)',
      email: 'boss@propdeskit.com',
      password: passwordBoss,
      role: 'EXECUTIVE',
    },
  });

  console.log('✅ Admin Accounts created:');
  console.log('   - Luis: luis@propdeskit.com (admin123)');
  console.log('   - Jefe: boss@propdeskit.com (boss123)');

  // 2. Create Real Estate Companies with custom prefixes
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

  console.log('✅ Real Estate Companies created with custom prefixes.');

  // 3. Create Sample Tickets
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1000 * 60 * 60);
  const threeHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 3);
  const oneDayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24);

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

  const t3 = await prisma.ticket.create({
    data: {
      ticketNumber: 'METRO-0001',
      companyId: metro.id,
      requesterName: 'David Chen',
      requesterEmail: 'dchen@metrolivingre.com',
      category: 'SECURITY',
      title: 'Targeted phishing email received by accounting impersonating Managing Broker',
      description: 'Accounting received an email requesting a wire transfer change for Escrow #8841.',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignedTo: 'Luis (IT Lead)',
      resolutionNotes: 'Quarantined the phishing email across all Microsoft 365 mailboxes, blocked the sender domain in Defender.',
      createdAt: oneDayAgo,
      updatedAt: oneDayAgo,
      resolvedAt: oneDayAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t3.id,
      action: 'RESOLVED',
      actor: 'Luis (IT Lead)',
      details: 'Incidencia resuelta. Dominio bloqueado.',
      createdAt: oneDayAgo,
    },
  });

  console.log('✅ Tickets created.');
  console.log('🎉 Database seeding completed successfully in PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
