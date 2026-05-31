import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { ROLE_LABELS } from "../constants.js";
import Sidebar from "./Sidebar.jsx";
import NotificationBell from "./NotificationBell.jsx";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Layout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F7]" style={{ fontFamily: "Poppins, sans-serif" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative z-30 flex h-[88px] shrink-0 items-center justify-end border-b border-[#D1D1D1]/70 bg-[#FAF9F7] px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDB706] text-[13px] font-semibold text-[#2D2922]">
                {initials(user?.name)}
              </div>
              <div className="leading-tight">
                <div className="text-[14px] font-medium text-black">{user?.name}</div>
                <div className="text-[12px] font-light text-black/70">
                  {ROLE_LABELS[user?.role] || user?.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
