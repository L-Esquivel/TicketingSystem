'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  CheckCircle2,
  Lock,
  Save,
  Trash2,
  History,
} from 'lucide-react';
import { Ticket, Status, Priority } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatTimeAgo, CATEGORY_LABELS } from '../lib/utils';
import { toast } from 'sonner';

interface TicketDetailModalProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: (updatedTicket: Ticket) => void;
  onTicketDeleted?: (ticketId: string) => void;
}

export function TicketDetailModal({
  ticketId,
  isOpen,
  onClose,
  onTicketUpdated,
  onTicketDeleted,
}: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form editable states
  const [status, setStatus] = useState<Status>('OPEN');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('IT Support');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      fetch(`/api/tickets/${ticketId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const t = data.data;
            setTicket(t);
            setStatus(t.status);
            setPriority(t.priority);
            setAssignedTo(t.assignedTo || 'IT Support');
            setResolutionNotes(t.resolutionNotes || '');
            setInternalNotes(t.internalNotes || '');
          }
        })
        .catch((err) => {
          toast.error('Error loading ticket details');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          priority,
          assignedTo,
          resolutionNotes,
          internalNotes,
          actor: 'Luis (IT Lead)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error updating ticket');
      }

      setTicket(data.data);
      onTicketUpdated(data.data);
      toast.success(`Incident ${ticket.ticketNumber} updated successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    if (!confirm(`Are you sure you want to delete incident ${ticket.ticketNumber}?`)) return;

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Incident ${ticket.ticketNumber} deleted`);
        onTicketDeleted?.(ticket.id);
        onClose();
      }
    } catch (err) {
      toast.error('Error deleting ticket');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-base shadow-sm">
              {ticket?.ticketNumber || '...'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {ticket?.company?.prefix}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {ticket?.company?.name || 'Loading...'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reported on {formatDate(ticket?.createdAt)} ({formatTimeAgo(ticket?.createdAt)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              title="Delete incident"
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            Loading incident details...
          </div>
        ) : ticket ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Left 2 Cols: Incident Details & Notes */}
            <div className="lg:col-span-2 p-6 space-y-6">
              {/* Incident Title & Category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {CATEGORY_LABELS[ticket.category]?.label || ticket.category}
                  </span>
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {ticket.title}
                </h3>
              </div>

              {/* Exact Description Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Reported Issue Description:
                </h4>
                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Requester Information Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Requester</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {ticket.requesterName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block font-medium">Email Address</span>
                    <a
                      href={`mailto:${ticket.requesterEmail}`}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {ticket.requesterEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* IT Support Action Notes */}
              <div className="space-y-4 pt-2">
                {/* Resolution Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolution & Fix Notes (Client / Requester Facing)
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe troubleshooting steps, patches applied, or instructions for the user..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none resize-y"
                  />
                </div>

                {/* Internal IT Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    Internal IT Notes (Confidential / Private Log)
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Technical logs, vendor ticket numbers, temporary credentials, network IP info..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Status Controls & Audit Trail */}
            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status & Assignment Controls
                </h4>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="OPEN">⏳ Open (Pending)</option>
                    <option value="IN_PROGRESS">🚀 In Progress</option>
                    <option value="WAITING">⏸️ Waiting / On Hold</option>
                    <option value="RESOLVED">✅ Resolved</option>
                    <option value="CLOSED">📁 Closed</option>
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🔵 Medium</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="CRITICAL">🔴 Critical</option>
                  </select>
                </div>

                {/* Assigned Specialist */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Specialist
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Luis (IT Lead)"
                    className="w-full px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* History Timeline */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Activity History
                  </h5>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {ticket.history && ticket.history.length > 0 ? (
                      ticket.history.map((hist) => (
                        <div key={hist.id} className="text-xs border-l-2 border-blue-500 pl-3 py-0.5 space-y-0.5">
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {hist.actor}
                            </span>
                            <span>{formatTimeAgo(hist.createdAt)}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-snug">
                            {hist.details}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No activity logged yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <span>Saving changes...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Incident Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
