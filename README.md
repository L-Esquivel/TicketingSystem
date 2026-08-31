# PropDesk IT Support — Multi-Tenant Real Estate Ticketing System

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Deployment](https://img.shields.io/badge/Render-Blueprint%20Ready-46E3B7?style=flat&logo=render)](https://render.com/)

A modern, enterprise-grade multi-tenant IT incident management and ticketing platform engineered specifically for IT Leads, MSPs, and administrators managing technical infrastructure across multiple **US Real Estate businesses, brokerage firms, and property management companies**.

---

## 🌟 Key Capabilities

### 1. 🏢 Multi-Tenant Brokerage Isolation
- Register, manage, and isolate technical support operations across multiple independent real estate businesses.
- Switch between **Global Super Admin View** (all businesses combined) or **Single Company Isolated View**.

### 2. 🔢 Atomic Incident Numbering with Custom Prefixes
- Every real estate company configures its own custom ticket ID prefix (e.g., `APEX`, `SUNSET`, `METRO`, `REALTY`).
- Race-condition-free, atomic transaction counters guarantee clean sequential incident IDs (e.g., `SUNSET-0001`, `APEX-0024`).

### 3. 🔐 Enterprise Authentication & Role Protection
- Role-based middleware protecting administrative dashboards, incident management, and brokerage directories.
- Built-in session security with JWTs, bcrypt password hashing, and HTTP-only cookies.
- **Preconfigured Super Admin (`luis@propdeskit.com`)** & **Executive Director (`boss@propdeskit.com`)** accounts with automatic bootstrapping on fresh deployments.

### 4. 📬 Automated Real-Time Email Notifications
- Real-time formatted HTML dispatch to the IT Lead whenever a new incident is submitted.
- Includes incident priority badges, exact error descriptions, requester contact details, and a 1-click button linking directly to the management dashboard.
- Full SMTP support (Gmail App Passwords, Microsoft 365 / Outlook, Amazon SES, SendGrid, Brevo).

### 5. 📊 Centralized IT Control & Audit Trails
- **Real-Time SLA & KPI Cards**: Total tickets, open pending count, in-progress items, and critical/high alerts.
- **Dual-Note System**: Public resolution notes (client/agent-facing) and confidential internal IT notes (technical credentials, IP addresses, vendor ticket numbers).
- **Full Audit History**: Chronological timeline tracking every status change, reassignment, and note update.
- **One-Click CSV Export**: Download complete incident logs for client reporting and billing.

### 6. 🌐 Streamlined Client & Realtor Submit Portal (`/submit`)
- Dedicated, intuitive public portal allowing real estate agents, brokers, and property managers to submit technical issues without needing admin credentials.
- Instant ticket number confirmation upon submission.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions, REST API) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | [Jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) with responsive HTML templates |
| **Infrastructure** | [Render](https://render.com/) (Infrastructure-as-Code via `render.yaml`) & [Docker](https://www.docker.com/) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/L-Esquivel/TicketingSystem.git
cd TicketingSystem
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Local PostgreSQL (via Docker)
Start the PostgreSQL container on port `5433`:
```bash
docker-compose up -d
```

### 4. Push Database Schema & Seed
```bash
npx prisma db push
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Initial Operator Setup & Administrative Access

On first deployment or fresh database initialization, the operator defines the initial Super Administrator credentials using environment variables:

- `INITIAL_ADMIN_EMAIL`: The operator's primary administrative email address.
- `INITIAL_ADMIN_PASSWORD`: The initial temporary administrator password.

> 🔒 **Mandatory Password Change**: Any initial bootstrapped account is flagged with `mustChangePassword: true`. Upon first login, the platform forces an immediate, mandatory password update before granting access to the dashboard.

---

## ☁️ Production Deployment on Render

This repository includes a native **Render Blueprint (`render.yaml`)** that automatically provisions both the Next.js Web Service and a Managed PostgreSQL Database:

1. Connect your GitHub repository to [Render](https://dashboard.render.com/).
2. Go to **Blueprints > New Blueprint Instance** and select your repository.
3. Define your initial administrator credentials (`INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`) in Render Environment Variables.
4. Render will automatically:
   - Provision the managed **PostgreSQL** instance.
   - Run `npx prisma db push` to generate the relational schema.
   - Compile the Next.js production build and bind environment variables.

---

## ⚙️ Environment Variables Reference (`.env`)

```env
# Database Connection URL (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/ticketing_db?schema=public"

# Operator Initial Admin Bootstrapping
INITIAL_ADMIN_EMAIL="admin@yourdomain.com"
INITIAL_ADMIN_PASSWORD="OperatorSetSecurePassword2026!"

# App & Security Configuration
NEXT_PUBLIC_APP_NAME="PropDesk IT Support"
NEXT_PUBLIC_APP_DESCRIPTION="Multi-Tenant IT Ticketing System for Real Estate Businesses"
NEXT_PUBLIC_APP_URL="https://your-app.onrender.com"
JWT_SECRET="generate-a-secure-random-secret-key"

# 📧 SMTP Email Notifications (Optional - for live email delivery)
NOTIFICATION_EMAIL="your-personal-email@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-google-app-password"
SMTP_FROM="\"PropDesk IT Alerts\" <your-email@gmail.com>"
```

---

## 📂 Project Structure

```
├── prisma/
│   ├── schema.prisma              # Relational models (AdminUser, Company, Ticket, TicketHistory)
│   └── seed.ts                    # Realistic Real Estate sample seed data
├── src/
│   ├── app/
│   │   ├── api/                   # REST API routes (Auth, Companies, Tickets, Stats, Seed)
│   │   ├── companies/page.tsx     # Brokerage directory, edit & delete controls
│   │   ├── tickets/page.tsx       # Dedicated incident management & table
│   │   ├── submit/page.tsx        # Client-facing submission portal
│   │   ├── login/page.tsx         # Authentication screen with quick switcher
│   │   ├── page.tsx               # IT Support central dashboard
│   │   └── layout.tsx             # Global layout & toast notification provider
│   ├── components/                # Modular reusable React components
│   │   ├── Navbar.tsx             # Top bar, search, dark mode & company selector
│   │   ├── Sidebar.tsx            # Navigation & profile controls
│   │   ├── StatsOverview.tsx      # SLA & KPI metric cards
│   │   ├── TicketTable.tsx        # Interactive ticket table with CSV export
│   │   ├── TicketDetailModal.tsx  # Dual-note inspector & status changer
│   │   ├── CreateTicketModal.tsx  # Incident creation modal with prefix preview
│   │   ├── CreateCompanyModal.tsx # Company registration modal
│   │   └── EditCompanyModal.tsx   # Company editing modal
│   ├── lib/
│   │   ├── auth.ts                # JWT verification, password hashing & session helpers
│   │   ├── email.ts               # Nodemailer integration & HTML email templates
│   │   ├── prisma.ts              # Singleton Prisma client
│   │   ├── tickets.ts             # Atomic sequence generation logic
│   │   └── utils.ts               # Status, priority & category configurations
│   └── types/
│       └── index.ts               # Shared TypeScript interfaces
├── render.yaml                    # Render Blueprint Infrastructure-as-Code
├── docker-compose.yml             # Local PostgreSQL container configuration
└── package.json                   # Dependencies and npm scripts
```

---

## 📄 License
This project is proprietary and maintained for Luis Esquivel.
