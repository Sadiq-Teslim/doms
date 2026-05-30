import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { ROLE_NAV } from "../constants.js";
import { NAV_ICONS } from "./Icons.jsx";

const NAV_ITEMS = {
  dashboard: { to: "/", label: "Dashboard" },
  tickets: { to: "/tickets", label: "Tickets" },
  create: { to: "/tickets/new", label: "New Ticket" },
  trucks: { to: "/trucks", label: "Trucks" },
  safety: { to: "/safety", label: "Safety Queue" },
  dispatch: { to: "/dispatch", label: "Dispatch" },
  overloads: { to: "/overloads", label: "Overloads" },
  gate: { to: "/gate", label: "Gate Clearance" },
  users: { to: "/users", label: "Users" },
  audit: { to: "/audit", label: "Audit Log" },
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = ROLE_NAV[user?.role] || ["dashboard"];

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-forest p-5 text-white md:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-white">
          D
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-none">DOMS</div>
          <div className="text-[11px] text-white/50">Depot Operations</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((key) => {
          const item = NAV_ITEMS[key];
          const Icon = NAV_ICONS[key];
          if (!item) return null;
          return (
            <NavLink
              key={key}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {Icon && <Icon size={19} />}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 rounded-xl bg-white/5 px-3 py-3 text-[11px] leading-relaxed text-white/45">
        Depot Operations Management System
      </div>
    </aside>
  );
}
