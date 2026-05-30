# Depot Operations Management System (DOMS)

A full-stack app that digitizes depot loading, safety compliance, dispatch, overload management, and gate clearance into one centralized workflow.

**Stack:** React (Vite) + Tailwind · Express + Prisma · PostgreSQL · server-side PDF (pdfkit) · JWT role-based auth.

## Workflow

```
Logistics (create ticket)
   → Safety (digital checklist → approve/reject)
      → Dispatch (generate waybill; overload auto-detected)
         → Admin (review overload)            ← only if overloaded
            → Gate (verify + PIN clear → truck exits)
Admin monitors everything via Audit Log + dashboard.
```

## Local development

```bash
npm run install:all                 # install root + server + client deps
# set server/.env (DATABASE_URL, JWT_SECRET) — see server/.env example
npm run setup                       # apply schema + seed sample data
npm run dev                         # server :4000 + client :5173
```

Open http://localhost:5173

## Accounts (password: `password123`)

| Role      | Email                    | Responsibility     |
|-----------|--------------------------|--------------------|
| Logistics | logistics@apexdepot.com  | Creates tickets    |
| Safety    | safety@apexdepot.com     | Inspects tickets   |
| Dispatch  | dispatch@apexdepot.com   | Generates waybills |
| Admin     | admin@apexdepot.com      | Overloads + audit  |
| Gate      | gate@apexdepot.com       | Exit PIN: `1234`   |
| Driver    | driver@apexdepot.com     | Views documents    |

Created by `npm run setup`; change them from Admin → Users.

## Layout
- `client/` — Vite + React + Tailwind UI
- `server/` — Express API + Prisma schema/seed

## Environment variables
- **server**: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`
- **client**: `VITE_API_URL` (deployed backend URL incl. `/api`; unset locally)
