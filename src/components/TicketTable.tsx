'use client';

import React, { useState } from 'react';
import { Ticket, Status, Priority } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatTimeAgo, CATEGORY_LABELS } from '@/lib/utils';
import {
  Download,
  Filter,
  Eye,
  Building2,
  User,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface TicketTableProps {
  tickets: Ticket[];
  loading?: boolean;
  onSelectTicket: (ticket: Ticket) => void;
  onQuickStatusChange?: (ticketId: string, newStatus: Status) => void;
  selectedStatusTab?: string;
  onTabChange?: (tab: string) => void;
}

export function TicketTable({
  tickets,
  loading = false,
  onSelectTicket,
  onQuickStatusChange,
  selectedStatusTab = 'ALL',
  onTabChange,
}: TicketTableProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const tabs = [
    { id: 'ALL', label: 'Todos', count: tickets.length },
    { id: 'OPEN', label: 'Abiertos', count: tickets.filter((t) => t.status === 'OPEN').length },
    {
      id: 'IN_PROGRESS',
      label: 'En Progreso',
      count: tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'WAITING').length,
    },
    {
      id: 'RESOLVED',
      label: 'Resueltos',
      count: tickets.filter((t) => t.status === 'RESOLVED').length,
    },
    { id: 'CLOSED', label: 'Cerrados', count: tickets.filter((t) => t.status === 'CLOSED').length },
  ];

  // Filter tickets by active tab and priority
  const filteredTickets = tickets.filter((ticket) => {
    if (selectedStatusTab === 'OPEN' && ticket.status !== 'OPEN') return false;
    if (
      selectedStatusTab === 'IN_PROGRESS' &&
      ticket.status !== 'IN_PROGRESS' &&
      ticket.status !== 'WAITING'
    )
      return false;
    if (selectedStatusTab === 'RESOLVED' && ticket.status !== 'RESOLVED') return false;
    if (selectedStatusTab === 'CLOSED' && ticket.status !== 'CLOSED') return false;

    if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) return false;

    return true;
  });

  const exportCSV = () => {
    if (filteredTickets.length === 0) {
      toast.error('No hay tickets para exportar');
      return;
    }

    const headers = [
      'Ticket Number',
      'Empresa',
      'Prefijo',
      'Solicitante',
      'Email',
      'Categoria',
      'Prioridad',
      'Estado',
      'Titulo',
      'Descripcion',
      'Fecha Creacion',
      'Notas Resolucion',
    ];

    const rows = filteredTickets.map((t) => [
      `"${t.ticketNumber}"`,
      `"${t.company?.name || ''}"`,
      `"${t.company?.prefix || ''}"`,
      `"${t.requesterName}"`,
      `"${t.requesterEmail}"`,
      `"${t.category}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.createdAt}"`,
      `"${(t.resolutionNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IT_Support_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Reporte CSV exportado exitosamente');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Top Filter Tabs and Actions */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = selectedStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Priority Filter & CSV Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas las prioridades</option>
              <option value="CRITICAL">🔴 Crítica</option>
              <option value="HIGH">🟠 Alta</option>
              <option value="MEDIUM">🔵 Media</option>
              <option value="LOW">🟢 Baja</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4"># Incidencia</th>
              <th className="py-3 px-4">Empresa (Real Estate)</th>
              <th className="py-3 px-4">Usuario Solicitante</th>
              <th className="py-3 px-4">Incidencia / Asunto</th>
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Antigüedad</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-4 px-4">
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-sm">No se encontraron tickets con los filtros aplicados</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-colors group"
                >
                  {/* Ticket Number with prefix */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    <span className="bg-blue-50 dark:bg-blue-950/80 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
                      {ticket.ticketNumber}
                    </span>
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ticket.company?.prefix}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {ticket.company?.name}
                      </span>
                    </div>
                  </td>

                  {/* Requester User */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {ticket.requesterName}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {ticket.requesterEmail}
                      </span>
                    </div>
                  </td>

                  {/* Incident Summary */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white truncate block">
                        {ticket.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                        {ticket.description}
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Status with Click to Quick Change */}
                  <td
                    className="py-3.5 px-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onQuickStatusChange ? (
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          onQuickStatusChange(ticket.id, e.target.value as Status)
                        }
                        className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="OPEN">⏳ Abierto</option>
                        <option value="IN_PROGRESS">🚀 En Progreso</option>
                        <option value="WAITING">⏸️ En Espera</option>
                        <option value="RESOLVED">✅ Resuelto</option>
                        <option value="CLOSED">📁 Cerrado</option>
                      </select>
                    ) : (
                      <StatusBadge status={ticket.status} />
                    )}
                  </td>

                  {/* Created Time */}
                  <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                    {formatTimeAgo(ticket.createdAt)}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTicket(ticket);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Ver detalle completo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Mostrando {filteredTickets.length} de {tickets.length} incidencias</span>
        <span className="font-mono text-[11px] text-slate-400">Numeración Atómica Multi-Empresa</span>
      </div>
    </div>
  );
}
