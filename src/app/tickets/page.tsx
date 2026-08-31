'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { TicketTable } from '../../components/TicketTable';
import { CreateTicketModal } from '../../components/CreateTicketModal';
import { TicketDetailModal } from '../../components/TicketDetailModal';
import { Ticket, Status } from '../../types';
import { PlusCircle, Ticket as TicketIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketsPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');

  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(
        `/api/tickets?companyId=${selectedCompanyId}${queryParam}`
      );
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleQuickStatusChange = async (ticketId: string, newStatus: Status) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor: 'Luis (IT Lead)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ticket status updated to ${newStatus}`);
        fetchTickets();
      }
    } catch (err) {
      toast.error('Error updating ticket status');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      <Sidebar onOpenCreateTicket={() => setIsCreateTicketOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <TicketIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Incident & Ticket Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Filter, inspect, resolve, and audit support tickets across all real estate businesses.
              </p>
            </div>

            <button
              onClick={() => setIsCreateTicketOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              New Incident
            </button>
          </div>

          {/* Table */}
          <TicketTable
            tickets={tickets}
            loading={loading}
            selectedStatusTab={selectedStatusTab}
            onTabChange={setSelectedStatusTab}
            onSelectTicket={(ticket) => {
              setSelectedTicket(ticket);
              setIsDetailOpen(true);
            }}
            onQuickStatusChange={handleQuickStatusChange}
          />
        </main>
      </div>

      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={() => fetchTickets()}
        defaultCompanyId={selectedCompanyId}
      />

      <TicketDetailModal
        ticketId={selectedTicket?.id || null}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={() => fetchTickets()}
        onTicketDeleted={() => fetchTickets()}
      />
    </div>
  );
}
