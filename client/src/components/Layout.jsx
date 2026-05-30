import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { IconLogout } from "./Icons.jsx";
import Logo from "./Logo.jsx";

const ROLE_LABELS = {
  LOGISTICS: "Logistics Officer",
  SAFETY: "Safety Officer",
  DISPATCH: "Dispatch Officer",
  GATE: "Gate / Security",
  ADMIN: "Administrator",
  DRIVER: "Driver",
};

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative z-30 flex items-center justify-between border-b border-ink/[0.06] bg-cream-100/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2 md:hidden">
            <Logo size={30} rounded={9} />
            <span className="font-display text-lg font-bold text-forest">DOMS</span>
          </div>
          <div className="hidden text-sm font-medium text-ink-400 md:block">
            {ROLE_LABELS[user?.role] || user?.role} Console
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-white py-1 pl-1 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                {initials(user?.name)}
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold leading-tight text-ink">{user?.name}</div>
                <div className="text-[11px] text-ink-400">{ROLE_LABELS[user?.role]}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white text-ink-500 transition hover:border-coral/40 hover:text-coral"
            >
              <IconLogout size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
