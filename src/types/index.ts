export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type Category = 
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'NETWORK'
  | 'ACCESS'
  | 'EMAIL'
  | 'MLS_REALTY'
  | 'PRINTER_PERIPHERALS'
  | 'SECURITY'
  | 'GENERAL';

export interface Company {
  id: string;
  name: string;
  prefix: string;
  ticketCounter: number;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    tickets: number;
  };
}

export interface TicketHistoryItem {
  id: string;
  ticketId: string;
  action: string;
  actor: string;
  details: string;
  createdAt: string | Date;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  companyId: string;
  company?: Company;
  requesterName: string;
  requesterEmail: string;
  category: Category | string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo?: string | null;
  resolutionNotes?: string | null;
  internalNotes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  resolvedAt?: string | Date | null;
  history?: TicketHistoryItem[];
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byCompany: {
    companyId: string;
    companyName: string;
    companyPrefix: string;
    count: number;
    openCount: number;
  }[];
  recentActivity: TicketHistoryItem[];
}
