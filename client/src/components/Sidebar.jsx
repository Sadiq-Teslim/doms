import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { ROLE_NAV, NAV_ITEMS, ROLE_LABELS } from "../constants.js";
import { NAV_ICONS, IconCollapse, IconLogout } from "./Icons.jsx";

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const keys = ROLE_NAV[user?.role] || ["home"];

  return (
    <aside
      className={`hidden h-screen shrink-0 flex-col bg-[#F1F1F1] py-7 transition-[width] duration-200 md:flex ${
        collapsed ? "w-[84px] px-3 items-center" : "w-[260px] px-5"
      }`}
    >
      {/* Brand + collapse toggle */}
      <div className={`mb-2 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && <img src="/bovas-logo.png" alt="BOVAS & Company" className="h-7 w-auto" />}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B665E] transition hover:bg-black/5"
        >
          <IconCollapse size={18} />
        </button>
      </div>

      {!collapsed && (
        <div className="mb-7 text-[12px] font-normal text-[#A57506]">
          {ROLE_LABELS[user?.role] || user?.role} Dashboard
        </div>
      )}
      {collapsed && <div className="mb-7" />}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-2">
        {keys.map((key) => {
          const item = NAV_ITEMS[key];
          const Icon = NAV_ICONS[key];
          if (!item) return null;
          return (
            <NavLink
              key={key}
              to={item.to}
              end={item.to === "/dashboard"}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-[6px] text-[14px] transition ${
                  collapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2"
                } ${
                  isActive
                    ? "bg-[#FDB706] font-medium text-[#2D2922]"
                    : "font-normal text-[#6B665E] hover:bg-black/5"
                }`
              }
            >
              {Icon && <Icon size={20} />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        title={collapsed ? "Logout" : undefined}
        className={`mt-4 flex items-center rounded-[6px] text-[14px] text-[#E74C3C] transition hover:bg-[#E74C3C]/10 ${
          collapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2"
        }`}
      >
        <span className="-scale-x-100"><IconLogout size={20} /></span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
