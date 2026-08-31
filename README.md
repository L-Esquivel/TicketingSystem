# PropDesk IT Support - Multi-Tenant Ticketing System

Sistema profesional y robusto de gestión de incidencias y soporte técnico de IT diseñado para administradores que gestionan múltiples negocios de bienes raíces (**Real Estate**) en Estados Unidos.

---

## ✨ Características Principales

1. **🏢 Aislamiento Multi-Empresa (Multi-Tenancy)**:
   - Registro de múltiples negocios de Real Estate con datos de contacto y administración.
   - Vista aislada por empresa o panel global de Super Admin.

2. **🔢 Numeración Atómica con Prefijos Personalizables**:
   - Cada empresa define su propio código o prefijo (ej. `APEX`, `SUNSET`, `METRO`, `HCREST`).
   - Las incidencias generan de forma automática y atómica números de ticket secuenciales con el prefijo correspondiente (ej. `SUNSET-0001`, `APEX-0024`).

3. **📊 Datos de Incidencias Centralizados**:
   - **Número de Incidencia** único y correlativo.
   - **Empresa** que lo generó.
   - **Usuario** que lo generó (Nombre y Email).
   - **Incidencia Exacta** (Título resumido y descripción detallada).
   - **Nivel de Prioridad**: *Baja (LOW)*, *Media (MEDIUM)*, *Alta (HIGH)*, *Crítica (CRITICAL)*.
   - **Estados de Resolución**: *Abierto (OPEN)*, *En Progreso (IN_PROGRESS)*, *En Espera (WAITING)*, *Resuelto (RESOLVED)*, *Cerrado (CLOSED)*.
   - **Categorías de IT**: Hardware, Software, Red/Internet, Accesos/Contraseñas, Correo/Outlook, Plataformas MLS Inmobiliarias, Impresoras, Seguridad.

4. **⚡ Panel de Control de IT (Super Admin Dashboard)**:
   - Tarjetas de KPIs y métricas en tiempo real.
   - Alertas automáticas para incidencias críticas y urgentes.
   - Búsqueda instantánea y filtros avanzados.
   - Notas de solución (públicas para el cliente) y notas internas de soporte de IT (privadas).
   - Trazabilidad y registro de auditoría cronológico de cada cambio.
   - Exportación de reportes a formato **CSV**.

5. **🌐 Portal de Clientes / Agentes Inmobiliarios**:
   - Formulario web optimizado y accesible para que los agentes y personal de las empresas reporten problemas en segundos con confirmación inmediata del ID generado.

---

## 🛠️ Stack Tecnológico

- **Frontend & Backend**: Next.js 14 (App Router, Server Actions, REST API, React 18, TypeScript).
- **Estilos & UI**: Tailwind CSS, Lucide Icons, Sonner (Toasts), Modo Oscuro / Claro.
- **Base de Datos & ORM**: Prisma ORM con SQLite (desarrollo local sin configuración previa) y compatibilidad total con PostgreSQL (Docker / Cloud).
- **Contenedores**: Dockerfile multi-etapa y `docker-compose.yml` listos para producción.

---

## 🚀 Instalación y Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/L-Esquivel/TicketingSystem.git
cd TicketingSystem
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar y poblar la Base de Datos
El proyecto viene preconfigurado con SQLite para desarrollo local inmediato:
```bash
# Sincronizar esquema de base de datos
npx prisma db push

# Poblar con datos de prueba realistas (Empresas de Real Estate y tickets de ejemplo)
npx ts-node prisma/seed.ts
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

---

## 🐳 Ejecución con Docker

Si prefieres ejecutar todo con Docker y PostgreSQL:

```bash
docker-compose up -d --build
```
La aplicación estará disponible en `http://localhost:3000` conectada a su propia instancia de PostgreSQL en el puerto `5432`.

---

## 📂 Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma              # Definición de modelos (Company, Ticket, TicketHistory)
│   └── seed.ts                    # Datos de prueba para Real Estate
├── src/
│   ├── app/
│   │   ├── api/                   # Endpoints REST para Tickets, Empresas y Estadísticas
│   │   │   ├── companies/
│   │   │   ├── tickets/
│   │   │   └── stats/
│   │   ├── companies/page.tsx     # Gestión de empresas y configuración de prefijos
│   │   ├── tickets/page.tsx       # Listado y gestión completa de incidencias
│   │   ├── submit/page.tsx        # Portal para reporte de tickets por clientes
│   │   ├── page.tsx               # Dashboard principal de IT Support
│   │   └── layout.tsx             # Layout global con Toaster y temas
│   ├── components/                # Componentes modulares y reutilizables
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatsOverview.tsx
│   │   ├── TicketTable.tsx
│   │   ├── TicketDetailModal.tsx
│   │   ├── CreateTicketModal.tsx
│   │   ├── CreateCompanyModal.tsx
│   │   ├── PriorityBadge.tsx
│   │   └── StatusBadge.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Cliente Singleton de Prisma
│   │   ├── tickets.ts             # Generador atómico de secuencias con prefijo
│   │   └── utils.ts               # Utilidades, formateo de fechas y categorías
│   └── types/
│       └── index.ts               # Interfaces y tipos TypeScript
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tailwind.config.ts
```

---

## 🔒 Variables de Entorno (`.env`)

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="PropDesk IT Support"
NEXT_PUBLIC_APP_DESCRIPTION="Multi-Tenant IT Ticketing System for Real Estate Businesses"
```
