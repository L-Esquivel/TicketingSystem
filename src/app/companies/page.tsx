'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { CreateCompanyModal } from '@/components/CreateCompanyModal';
import { CreateTicketModal } from '@/components/CreateTicketModal';
import { Company } from '@/types';
import {
  Building2,
  PlusCircle,
  Hash,
  Mail,
  Phone,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [targetCompanyId, setTargetCompanyId] = useState<string>('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      <Sidebar onOpenCreateTicket={() => setIsCreateTicketOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenCreateTicket={() => setIsCreateTicketOpen(true)} />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Empresas de Real Estate & Prefijos de Incidencias
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Configura cada negocio inmobiliario con su código único de generación automática de tickets.
              </p>
            </div>

            <button
              onClick={() => setIsCreateCompanyOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))
            ) : companies.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-500">
                <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="font-semibold">No hay empresas registradas aún.</p>
                <button
                  onClick={() => setIsCreateCompanyOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Registrar Primera Empresa
                </button>
              </div>
            ) : (
              companies.map((company) => (
                <div
                  key={company.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {company.prefix}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Secuencia actual: #{company.ticketCounter}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                          {company.name}
                        </h2>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {company._count?.tickets ?? 0} Tickets
                        </span>
                      </div>
                    </div>

                    {/* Next Ticket Preview */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Próximo ID a generar:
                      </span>
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {company.prefix}-{(company.ticketCounter + 1).toString().padStart(4, '0')}
                      </span>
                    </div>

                    {/* Contact & Location Details */}
                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {company.contactName && (
                        <p className="flex items-center gap-2">
                          <strong className="text-slate-400">Contacto:</strong> {company.contactName}
                        </p>
                      )}
                      {company.contactEmail && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${company.contactEmail}`} className="text-blue-500 hover:underline">
                            {company.contactEmail}
                          </a>
                        </p>
                      )}
                      {company.contactPhone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {company.contactPhone}
                        </p>
                      )}
                      {company.address && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {company.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setTargetCompanyId(company.id);
                        setIsCreateTicketOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Registrar Ticket
                    </button>

                    <Link
                      href={`/tickets?companyId=${company.id}`}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      Ver Incidencias <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <CreateCompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onSuccess={() => fetchCompanies()}
      />

      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={() => fetchCompanies()}
        defaultCompanyId={targetCompanyId}
      />
    </div>
  );
}
