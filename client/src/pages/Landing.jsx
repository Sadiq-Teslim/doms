import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
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

const btnGold =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#FDB706] px-6 py-3 text-[15px] font-semibold text-[#2D2922] transition hover:brightness-95 active:scale-[0.98]";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#2D2922]/15 bg-white px-6 py-3 text-[15px] font-semibold text-[#2D2922] transition hover:border-[#2D2922]/30";

export default function Landing() {
  const { user } = useAuth();
  const primaryTo = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "Go to Dashboard" : "Get started";

  return (
    <div className="min-h-screen bg-[#FFF8E1] text-[#2D2922]" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <img src="/bovas-logo.png" alt="BOVAS & Company" className="h-9 w-auto" />
        <Link
          to={primaryTo}
          className="inline-flex items-center gap-2 rounded-full bg-[#FDB706] px-5 py-2.5 text-[14px] font-semibold text-[#2D2922] transition hover:brightness-95"
        >
          {user ? "Dashboard" : "Sign in"}
          <IconArrowRight size={17} />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-6 lg:grid-cols-2 lg:pt-10">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] text-[#2D2922] sm:text-6xl">
            From loading bay
            <br />
            to gate, <span className="text-[#E1251B]">one flow.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-[#6B665E]">
            DOMS replaces paper tickets and radio calls with a single digital workflow across
            logistics, safety, dispatch, overload control and gate clearance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={primaryTo} className={btnGold}>
              {primaryLabel}
              <IconArrowRight size={18} />
            </Link>
            <a href="#workflow" className={btnGhost}>
              See the workflow
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-[#6B665E]">
            <span className="flex items-center gap-1.5">
              <IconCheck size={16} className="text-[#1E7E34]" /> Real-time tracking
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={16} className="text-[#1E7E34]" /> PDF waybills
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={16} className="text-[#1E7E34]" /> Full audit trail
            </span>
          </div>
        </div>

        {/* Image collage */}
        <div className="relative">
          <div className="absolute -right-6 -top-8 h-44 w-44 rounded-full bg-[#FDB706]/40 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 h-52 w-52 rounded-full bg-[#E1251B]/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)]">
            <img src={TRUCK} alt="Haulage truck on the road" className="h-[22rem] w-full object-cover" />
          </div>
          <div className="absolute -bottom-8 -left-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] sm:block">
            <img src={WAREHOUSE} alt="Depot warehouse" className="h-28 w-full object-cover" />
          </div>
          <div className="absolute -right-3 bottom-6 rounded-2xl border border-[#2D2922]/10 bg-white/95 px-4 py-3 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDB706] text-[#2D2922]">
                <IconCheck size={15} />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-bold text-[#2D2922]">Cleared for exit</div>
                <div className="text-[11px] text-[#6B665E]">Verified at the gate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow strip */}
      <section id="workflow" className="bg-[#2D2922] py-14 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium text-[#FDB706]">HOW IT WORKS</p>
          <h2 className="mt-1 text-center text-3xl font-bold">Five stages, fully connected</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {STEPS.map(({ Icon, label, sub }, i) => (
              <div
                key={label}
                className="relative rounded-2xl bg-white/5 p-5 text-center ring-1 ring-white/10"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDB706] text-[#2D2922]">
                  <Icon size={22} />
                </div>
                <div className="mt-3 text-base font-bold">{label}</div>
                <div className="text-xs text-white/55">{sub}</div>
                <div className="absolute -top-2 left-3 text-xs font-bold text-[#FDB706]">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#2D2922]">Ready to move your first load?</h2>
        <p className="mx-auto mt-3 max-w-md text-[#6B665E]">
          Sign in to your operations console and start a loading ticket in seconds.
        </p>
        <Link to={primaryTo} className={`${btnGold} mx-auto mt-6 w-fit px-7`}>
          {primaryLabel}
          <IconArrowRight size={18} />
        </Link>
      </section>

      <footer className="border-t border-[#2D2922]/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-[#6B665E] sm:flex-row">
          <img src="/bovas-logo.png" alt="BOVAS & Company" className="h-7 w-auto" />
          <span>Depot Operations Management System</span>
        </div>
      </footer>
    </div>
  );
}
