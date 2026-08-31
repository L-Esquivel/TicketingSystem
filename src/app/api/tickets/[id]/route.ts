import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

// GET /api/tickets/[id] - Fetch single ticket with complete history
export async function GET(request: Request, { params }: Params) {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id: params.id }, { ticketNumber: params.id.toUpperCase() }],
      },
      include: {
        company: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Update status, priority, notes, and record audit log
export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const { status, priority, assignedTo, resolutionNotes, internalNotes, actor } = body;

    const currentTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { company: true },
    });

    if (!currentTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const currentActor = actor || 'IT Support';
    const historyEntries: { action: string; actor: string; details: string }[] = [];

    // Detect changes
    if (status && status !== currentTicket.status) {
      historyEntries.push({
        action: 'STATUS_CHANGED',
        actor: currentActor,
        details: `Status changed from ${currentTicket.status} to ${status}`,
      });
    }

    if (priority && priority !== currentTicket.priority) {
      historyEntries.push({
        action: 'PRIORITY_CHANGED',
        actor: currentActor,
        details: `Priority changed from ${currentTicket.priority} to ${priority}`,
      });
    }

    if (assignedTo && assignedTo !== currentTicket.assignedTo) {
      historyEntries.push({
        action: 'ASSIGNED',
        actor: currentActor,
        details: `Reassigned to ${assignedTo}`,
      });
    }

    if (resolutionNotes && resolutionNotes !== currentTicket.resolutionNotes) {
      historyEntries.push({
        action: 'RESOLUTION_UPDATED',
        actor: currentActor,
        details: `Resolution notes updated`,
      });
    }

    if (internalNotes && internalNotes !== currentTicket.internalNotes) {
      historyEntries.push({
        action: 'NOTE_ADDED',
        actor: currentActor,
        details: `Internal IT note logged`,
      });
    }

    const isResolving = (status === 'RESOLVED' || status === 'CLOSED') && !currentTicket.resolvedAt;

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id: params.id },
        data: {
          status: status || undefined,
          priority: priority || undefined,
          assignedTo: assignedTo !== undefined ? assignedTo : undefined,
          resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : undefined,
          internalNotes: internalNotes !== undefined ? internalNotes : undefined,
          resolvedAt: isResolving ? new Date() : (status === 'OPEN' || status === 'IN_PROGRESS' ? null : undefined),
        },
        include: {
          company: true,
          history: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Insert audit history logs
      for (const entry of historyEntries) {
        await tx.ticketHistory.create({
          data: {
            ticketId: params.id,
            action: entry.action,
            actor: entry.actor,
            details: entry.details,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    await prisma.ticket.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
