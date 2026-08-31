'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatsOverview } from '@/components/StatsOverview';
import { TicketTable } from '@/components/TicketTable';
import { CreateTicketModal } from '@/components/CreateTicketModal';
import { CreateCompanyModal } from '@/components/CreateCompanyModal';
import { TicketDetailModal } from '@/components/TicketDetailModal';
import { Ticket, TicketStats, Status } from '@/types';
import {
  Building2,
  PlusCircle,
  AlertTriangle,
  History,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/stats?companyId=${selectedCompanyId}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch tickets
      const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const ticketsRes = await fetch(
        `/api/tickets?companyId=${selectedCompanyId}${queryParam}`
      );
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setTickets(ticketsData.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, searchQuery]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        toast.success(`Estado actualizado a ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    fetchDashboardData();
  };

  const handleCompanyCreated = (newCompany: any) => {
    fetchDashboardData();
  };

  const handleTicketUpdated = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    fetchDashboardData();
  };

  const criticalTickets = tickets.filter(
    (t) => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      {/* Sidebar */}
      <Sidebar
        onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
        onOpenCreateCompany={() => setIsCreateCompanyOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-800/40 p-6 rounded-2xl">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                IT Support Central • Real Estate
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                Panel de Control de Incidencias
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Supervisión multi-empresa, control de SLA y numeración correlativa con prefijos personalizados.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateCompanyOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                Nueva Empresa
              </button>
              <button
                onClick={() => setIsCreateTicketOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Incidencia
              </button>
            </div>
          </div>

          {/* Metric KPIs */}
          <StatsOverview stats={stats} loading={loading} />

          {/* Real Estate Businesses Status Overview */}
          {stats?.byCompany && stats.byCompany.length > 0 && selectedCompanyId === 'ALL' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Negocios de Real Estate & Prefijos Configurados
                </h2>
                <Link
                  href="/companies"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Gestionar Empresas <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.byCompany.map((c) => (
                  <div
                    key={c.companyId}
                    onClick={() => setSelectedCompanyId(c.companyId)}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {c.companyPrefix}
                      </span>
                      {c.openCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                          {c.openCount} pendientes
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          Al día
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {c.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Total histórico: <strong className="text-slate-700 dark:text-slate-200">{c.count}</strong> tickets
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical / Urgent Incidents Alert Section */}
          {criticalTickets.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <Flame className="w-5 h-5 animate-pulse" />
                  <h3 className="font-bold text-sm">
                    Incidencias Críticas y de Alta Prioridad Activas ({criticalTickets.length})
                  </h3>
                </div>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Atención requerida
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalTickets.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsDetailOpen(true);
                    }}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900/40 hover:border-rose-500 shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          • {ticket.company?.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                        {ticket.priority}
                      </span>
                    </div>

                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {ticket.title}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span>Reportado por: <strong>{ticket.requesterName}</strong></span>
                      <span>{formatTimeAgo(ticket.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                Tabla de Incidencias
              </h2>
            </div>

            <TicketTable
              tickets={tickets}
              loading={loading}
              onSelectTicket={(ticket) => {
                setSelectedTicket(ticket);
                setIsDetailOpen(true);
              }}
              onQuickStatusChange={handleQuickStatusChange}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={handleTicketCreated}
        defaultCompanyId={selectedCompanyId}
      />

      <CreateCompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onSuccess={handleCompanyCreated}
      />

      <TicketDetailModal
        ticketId={selectedTicket?.id || null}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={handleTicketUpdated}
        onTicketDeleted={() => fetchDashboardData()}
      />
    </div>
  );
}
