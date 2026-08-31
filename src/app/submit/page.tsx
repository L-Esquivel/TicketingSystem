'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { Company, Priority, Category } from '../../types';
import { CATEGORY_LABELS } from '../../lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SubmitTicketPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [category, setCategory] = useState<Category>('GENERAL');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);

  // Success state
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCompanies(data.data);
          setCompanyId(data.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const selectedCompany = companies.find((c) => c.id === companyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error('Please select your business / company');
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
          website_url: honeypot, // Anti-bot honeypot field
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error submitting support ticket');
      }

      setSubmittedTicket(data.data);
      toast.success(`Incident ${data.data.ticketNumber} submitted successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while submitting your ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setTitle('');
    setDescription('');
    setRequesterName('');
    setRequesterEmail('');
    setPriority('MEDIUM');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight">
              PropDesk IT Support Portal
            </h1>
            <p className="text-xs text-slate-400">
              IT Help Desk & Operations for Real Estate Brokerages & Property Management
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          IT Admin Login →
        </Link>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {submittedTicket ? (
          /* Success Screen */
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Ticket Created Successfully!
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                Your Incident ID:
              </h2>
              <div className="mt-4 inline-block px-6 py-3 rounded-2xl bg-blue-600/30 border border-blue-500/50 text-blue-300 font-mono text-2xl font-black tracking-wider shadow-inner">
                {submittedTicket.ticketNumber}
              </div>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Company:</span>
                <strong className="text-white">{selectedCompany?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requester:</span>
                <span className="text-white">{submittedTicket.requesterName} ({submittedTicket.requesterEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority:</span>
                <span className="font-bold text-amber-400">{submittedTicket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Status:</span>
                <span className="text-blue-400 font-semibold">{submittedTicket.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our IT Support team has received your ticket and will follow up with you directly via email.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Another Incident
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                IT Admin Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                IT Support Request Form
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                What technical issue are you experiencing?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Fill out the details below and our IT support lead will address your issue promptly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anti-bot Honeypot Field (Invisible to users & hidden from screen readers) */}
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="opacity-0 absolute left-[-9999px] pointer-events-none h-0 w-0 z-[-1]"
              />

              {/* Company Selection */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Select Your Real Estate Business *
                </label>
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.prefix}] - {c.name}
                    </option>
                  ))}
                </select>
                {selectedCompany && (
                  <p className="text-[11px] text-blue-400 mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Assigned prefix: <strong>{selectedCompany.prefix}</strong> (Generates {selectedCompany.prefix}-XXXX)
                  </p>
                )}
              </div>

              {/* User Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Your Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    placeholder="name@brokerage.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Urgency / Priority Level *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="LOW">🟢 Low - Minor question or inquiry</option>
                    <option value="MEDIUM">🔵 Medium - Single application or workstation glitch</option>
                    <option value="HIGH">🟠 High - MLS outage, email down, contract issue</option>
                    <option value="CRITICAL">🔴 Critical - Entire office offline or security threat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Technical Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Issue Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cannot log into MLS portal or printer unreachable"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Exact Incident Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened, what application or device is failing, and include any error messages..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Submitting incident...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Ticket to IT Support
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        PropDesk IT Support System • Multi-Tenant Real Estate Solution
      </footer>
    </div>
  );
}
