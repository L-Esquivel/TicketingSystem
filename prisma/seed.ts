import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Real Estate IT Support...');

  // Clean existing data
  await prisma.ticketHistory.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.adminUser.deleteMany({});

  const initialEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@propdeskit.com').trim().toLowerCase();
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMeImmediate2026!';
  const hashedPassword = await bcrypt.hash(initialPassword, 10);

  // 1. Create Initial Admin Account
  const admin = await prisma.adminUser.create({
    data: {
      name: process.env.INITIAL_ADMIN_NAME || 'Super Administrator',
      email: initialEmail,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      mustChangePassword: true,
    },
  });

  console.log('✅ Initial Admin Account created:');
  console.log(`   - Email: ${initialEmail}`);
  console.log('   - Flag: mustChangePassword = true');

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
      details: 'Incident reported with CRITICAL priority due to network outage.',
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
      assignedTo: 'IT Lead',
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
        details: 'Incident created with HIGH priority.',
        createdAt: threeHoursAgo,
      },
      {
        ticketId: t2.id,
        action: 'STATUS_CHANGED',
        actor: 'IT Lead',
        details: 'Status changed to IN_PROGRESS. Assigned to IT Lead.',
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
      assignedTo: 'IT Lead',
      resolutionNotes: 'Quarantined the phishing email across all mailboxes, blocked sender domain.',
      createdAt: oneDayAgo,
      updatedAt: oneDayAgo,
      resolvedAt: oneDayAgo,
    },
  });

  await prisma.ticketHistory.create({
    data: {
      ticketId: t3.id,
      action: 'RESOLVED',
      actor: 'IT Lead',
      details: 'Incident resolved. Sender domain blocked.',
      createdAt: oneDayAgo,
    },
  });

  console.log('✅ Tickets created.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
