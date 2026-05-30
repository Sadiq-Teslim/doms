import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { STATUS_LABELS, STATUS_STYLES } from "../constants.js";
import { IconArrowRight, IconTicket, IconTruck, IconFile, IconAlert, IconCheck } from "../components/Icons.jsx";

const QUICK_LINKS = {
  LOGISTICS: [
    { to: "/tickets/new", label: "Create Loading Ticket" },
    { to: "/trucks", label: "Manage Trucks" },
  ],
  SAFETY: [{ to: "/safety", label: "Open Inspection Queue" }],
  DISPATCH: [{ to: "/dispatch", label: "Open Dispatch Queue" }],
  GATE: [{ to: "/gate", label: "Open Gate Clearance" }],
  ADMIN: [
    { to: "/overloads", label: "Review Overloads" },
    { to: "/audit", label: "View Audit Log" },
    { to: "/users", label: "Manage Users" },
  ],
  DRIVER: [{ to: "/tickets", label: "View My Documents" }],
};

const CARD_META = [
  { key: "totalTickets", label: "Total Tickets", Icon: IconTicket, tone: "text-forest", bg: "bg-forest/10" },
  { key: "totalTrucks", label: "Trucks", Icon: IconTruck, tone: "text-brand-600", bg: "bg-brand-50" },
  { key: "totalWaybills", label: "Waybills", Icon: IconFile, tone: "text-gold-600", bg: "bg-gold-100" },
  { key: "pendingOverloads", label: "Pending Overloads", Icon: IconAlert, tone: "text-coral-600", bg: "bg-coral-100" },
  { key: "clearedToday", label: "Cleared Today", Icon: IconCheck, tone: "text-brand-600", bg: "bg-brand-50" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const totals = stats?.totals || {};
  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-forest p-8 text-white">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute -bottom-20 right-32 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-white/60">{greeting},</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{firstName} 👋</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Here's a live snapshot of depot operations across every stage of the workflow.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {(QUICK_LINKS[user?.role] || []).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest transition hover:bg-gold"
              >
                {l.label}
                <IconArrowRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {CARD_META.map(({ key, label, Icon, tone, bg }) => (
          <div key={key} className="card">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${tone}`}>
              <Icon size={20} />
            </div>
            <div className="mt-4 font-display text-3xl font-bold text-ink">
              {totals[key] ?? "—"}
            </div>
            <div className="mt-1 text-xs font-medium text-ink-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-5 font-display text-lg font-bold">Tickets by Status</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-ink/[0.06] bg-cream-100 px-4 py-3"
              >
                <span className={`chip ${STATUS_STYLES[key]}`}>{label}</span>
                <span className="font-display text-lg font-bold text-ink">
                  {stats ? stats.byStatus[key] || 0 : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-5 font-display text-lg font-bold">Workflow</h2>
          <ol className="space-y-4">
            {[
              ["Logistics", "Creates loading ticket"],
              ["Safety", "Inspects & approves"],
              ["Dispatch", "Generates waybill"],
              ["Admin", "Clears overloads"],
              ["Gate", "Confirms exit"],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{title}</div>
                  <div className="text-xs text-ink-400">{desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
