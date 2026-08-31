import prisma from './prisma';
import { Priority, Status, Category } from '../types';

export interface CreateTicketDTO {
  companyId: string;
  requesterName: string;
  requesterEmail: string;
  category?: Category | string;
  title: string;
  description: string;
  priority?: Priority;
}

export async function generateNextTicketNumber(companyId: string) {
  return await prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error(`Empresa con ID ${companyId} no encontrada`);
    }

    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: { ticketCounter: { increment: 1 } },
    });

    const sequence = updatedCompany.ticketCounter;
    const formattedSequence = sequence.toString().padStart(4, '0');
    const ticketNumber = `${company.prefix.toUpperCase()}-${formattedSequence}`;

    return { ticketNumber, company };
  });
}

export async function createTicket(data: CreateTicketDTO) {
  return await prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new Error(`Empresa con ID ${data.companyId} no encontrada`);
    }

    // Atomic increment of sequence
    const updatedCompany = await tx.company.update({
      where: { id: data.companyId },
      data: { ticketCounter: { increment: 1 } },
    });

    const sequence = updatedCompany.ticketCounter;
    const formattedSequence = sequence.toString().padStart(4, '0');
    const ticketNumber = `${company.prefix.toUpperCase()}-${formattedSequence}`;

    // Create ticket
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        companyId: data.companyId,
        requesterName: data.requesterName.trim(),
        requesterEmail: data.requesterEmail.trim().toLowerCase(),
        category: data.category || 'GENERAL',
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
        assignedTo: 'IT Support',
      },
      include: {
        company: true,
      },
    });

    // Create initial audit log
    await tx.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'CREATED',
        actor: data.requesterName.trim(),
        details: `Incidencia registrada con prioridad ${data.priority || 'MEDIUM'} en categoría ${data.category || 'GENERAL'}`,
      },
    });

    return ticket;
  });
}
