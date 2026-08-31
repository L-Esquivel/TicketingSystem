'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  X,
  Building2,
  User,
  Mail,
  AlertTriangle,
  FolderTree,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Company, Priority, Category } from '../types';
import { CATEGORY_LABELS } from '../lib/utils';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTicket: any) => void;
  defaultCompanyId?: string;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCompanyId,
}: CreateTicketModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState(defaultCompanyId || '');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [category, setCategory] = useState<Category>('GENERAL');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/companies')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setCompanies(data.data);
            if (!companyId || companyId === 'ALL') {
              setCompanyId(defaultCompanyId && defaultCompanyId !== 'ALL' ? defaultCompanyId : data.data[0].id);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen, defaultCompanyId]);

  if (!isOpen) return null;

  const selectedCompany = companies.find((c) => c.id === companyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error('Please select a company');
      return;
    }
    if (!requesterName.trim() || !requesterEmail.trim()) {
      toast.error('Please provide requester user details');
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error('Please describe the exact incident');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          requesterName,
          requesterEmail,
          category,
          priority,
          title,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create incident');
      }

      toast.success(
        `Incident ${data.data.ticketNumber} generated successfully for ${selectedCompany?.name}!`,
        { duration: 5000 }
      );
      onSuccess(data.data);
      onClose();

      // Reset form
      setTitle('');
      setDescription('');
      setRequesterName('');
      setRequesterEmail('');
      setPriority('MEDIUM');
    } catch (err: any) {
      toast.error(err.message || 'Error saving ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create New IT Incident Ticket
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A sequential ticket number will be generated with the business prefix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Company Selector & Number preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                Real Estate Business *
              </label>
              <select
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
              >
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    [{comp.prefix}] - {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-center bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Next Ticket ID
              </span>
              <p className="text-sm font-mono font-bold text-blue-900 dark:text-blue-200 mt-0.5">
                {selectedCompany
                  ? `${selectedCompany.prefix}-${(selectedCompany.ticketCounter + 1).toString().padStart(4, '0')}`
                  : '---'}
              </p>
            </div>
          </div>

          {/* Requester User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Requester Name *
              </label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="e.g. Sarah Jenkins, John Realtor"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Requester Email *
              </label>
              <input
                type="email"
                required
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                placeholder="sjenkins@apexrealtygroup.com"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
              >
                <option value="LOW">🟢 Low (General inquiry, non-urgent)</option>
                <option value="MEDIUM">🔵 Medium (Single workstation, standard software)</option>
                <option value="HIGH">🟠 High (MLS down, contracts, email issues)</option>
                <option value="CRITICAL">🔴 Critical (Total office outage, security threat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                IT Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Incident Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Incident Summary / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MLS Single Sign-On authentication failure for commercial team"
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Detailed Incident Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exact Incident Description (Details, error codes, steps to reproduce) *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe precisely what occurred, which devices or applications are impacted, and any visible error messages..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none resize-y"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span>Creating ticket...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Generate Incident Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
