import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import {
  IconArrowRight,
  IconTicket,
  IconShield,
  IconBox,
  IconAlert,
  IconBarrier,
  IconCheck,
} from "../components/Icons.jsx";

const TRUCK =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80";
const WAREHOUSE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80";

const STEPS = [
  { Icon: IconTicket, label: "Logistics", sub: "Create ticket" },
  { Icon: IconShield, label: "Safety", sub: "Inspect & approve" },
  { Icon: IconBox, label: "Dispatch", sub: "Generate waybill" },
  { Icon: IconAlert, label: "Admin", sub: "Clear overloads" },
  { Icon: IconBarrier, label: "Gate", sub: "Confirm exit" },
];

export default function Landing() {
  const { user } = useAuth();
  const primaryTo = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "Go to Dashboard" : "Get started";

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-display text-lg font-bold text-forest">DOMS</span>
        </div>
        <Link to={primaryTo} className="btn-primary">
          {user ? "Dashboard" : "Sign in"}
          <IconArrowRight size={17} />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-6 lg:grid-cols-2 lg:pt-10">
        <div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-ink sm:text-6xl">
            From loading bay
            <br />
            to gate, <span className="text-brand">one flow.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-500">
            DOMS replaces paper tickets and radio calls with a single digital workflow across
            logistics, safety, dispatch, overload control and gate clearance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={primaryTo} className="btn-primary px-6 py-3 text-base">
              {primaryLabel}
              <IconArrowRight size={18} />
            </Link>
            <a href="#workflow" className="btn-ghost px-6 py-3 text-base">
              See the workflow
            </a>
          </div>
          <div className="mt-8 flex items-center gap-5 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <IconCheck size={16} className="text-brand" /> Real-time tracking
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={16} className="text-brand" /> PDF waybills
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={16} className="text-brand" /> Full audit trail
            </span>
          </div>
        </div>

        {/* Image collage */}
        <div className="relative">
          <div className="absolute -right-6 -top-8 h-44 w-44 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-pop">
            <img src={TRUCK} alt="Haulage truck on the road" className="h-[22rem] w-full object-cover" />
          </div>
          <div className="absolute -bottom-8 -left-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-white shadow-pop sm:block">
            <img src={WAREHOUSE} alt="Depot warehouse" className="h-28 w-full object-cover" />
          </div>
          <div className="absolute -right-3 bottom-6 rounded-2xl border border-ink/10 bg-white/95 px-4 py-3 shadow-pop backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
                <IconCheck size={15} />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-bold text-ink">Cleared for exit</div>
                <div className="text-[11px] text-ink-400">Verified at the gate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow strip */}
      <section id="workflow" className="bg-forest py-14 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium text-white/50">HOW IT WORKS</p>
          <h2 className="mt-1 text-center font-display text-3xl font-bold">Five stages, fully connected</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {STEPS.map(({ Icon, label, sub }, i) => (
              <div
                key={label}
                className="relative rounded-2xl bg-white/5 p-5 text-center ring-1 ring-white/10"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon size={22} />
                </div>
                <div className="mt-3 font-display text-base font-bold">{label}</div>
                <div className="text-xs text-white/55">{sub}</div>
                <div className="absolute -top-2 left-3 font-display text-xs font-bold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">Ready to move your first load?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-500">
          Sign in to your operations console and start a loading ticket in seconds.
        </p>
        <Link to={primaryTo} className="btn-primary mx-auto mt-6 w-fit px-7 py-3 text-base">
          {primaryLabel}
          <IconArrowRight size={18} />
        </Link>
      </section>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-ink-400 sm:flex-row">
          <span className="font-display font-bold text-forest">DOMS</span>
          <span>Depot Operations Management System</span>
        </div>
      </footer>
    </div>
  );
}
