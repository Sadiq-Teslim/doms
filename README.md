# Depot Operations Management System (DOMS)

A full-stack app that digitizes depot loading, safety compliance, dispatch, overload management, and gate clearance into one centralized workflow.

**Stack:** React (Vite) + Tailwind · Express + Prisma · PostgreSQL (Docker) · server-side PDF (pdfkit) · JWT role-based auth.

## Workflow

```
Logistics (create ticket)
   → Safety (digital checklist → approve/reject)
      → Dispatch (generate waybill; overload auto-detected)
         → Admin (review overload)            ← only if overloaded
            → Gate (verify + PIN clear → truck exits)
Admin monitors everything via Audit Log + dashboard.
```

## Prerequisites
- Node.js 18+ and npm
- Docker (for PostgreSQL)

## Quick start

```bash
# 1. Install all dependencies (root + server + client)
npm run install:all

# 2. Start PostgreSQL
npm run db:up

# 3. Create the schema + load demo data
npm run setup

# 4. Run server (:4000) and client (:5173) together
npm run dev
```

Open http://localhost:5173

## User accounts (sign-in password: `password123`)

| Role      | Email                    | Responsibility     |
|-----------|--------------------------|--------------------|
| Logistics | logistics@apexdepot.com  | Creates tickets    |
| Safety    | safety@apexdepot.com     | Inspects tickets   |
| Dispatch  | dispatch@apexdepot.com   | Generates waybills |
| Admin     | admin@apexdepot.com      | Overloads + audit  |
| Gate      | gate@apexdepot.com       | Exit PIN: `1234`   |
| Driver    | driver@apexdepot.com     | Views documents    |

> Accounts and the gate PIN are created by `npm run setup`. Change them anytime from the Admin → Users screen.

## Project layout
- `server/` — Express API + Prisma schema/seed (port 4000)
- `client/` — Vite + React + Tailwind UI (port 5173)
- `docker-compose.yml` — PostgreSQL 16

## Out of scope (PRD future enhancements)
QR/RFID, SMS/email, CCTV, offline mode, cryptographic digital signatures, analytics charts.
