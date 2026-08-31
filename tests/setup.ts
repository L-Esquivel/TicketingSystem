import { beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '../src/lib/prisma';

// Ensure test database isolation and cleanup
beforeAll(async () => {
  // Wipe any existing test artifacts
  await cleanDatabase();
});

afterAll(async () => {
  // Clean up database after all test suites finish
  await cleanDatabase();
  await prisma.$disconnect();
});

export async function cleanDatabase() {
  try {
    await prisma.ticketHistory.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.adminUser.deleteMany({});
  } catch (error) {
    console.error('Error cleaning test database:', error);
  }
}
