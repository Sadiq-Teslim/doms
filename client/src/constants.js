export const STATUS_LABELS = {
  PENDING_SAFETY: "Pending Safety",
  SAFETY_APPROVED: "Safety Approved",
  SAFETY_REJECTED: "Safety Rejected",
  WAYBILL_GENERATED: "Waybill Generated",
  OVERLOAD_PENDING: "Overload Pending",
  OVERLOAD_APPROVED: "Overload Approved",
  OVERLOAD_REJECTED: "Overload Rejected",
  GATE_CLEARED: "Gate Cleared / Exited",
};

export const STATUS_STYLES = {
  PENDING_SAFETY: "bg-gold-100 text-gold-600",
  SAFETY_APPROVED: "bg-brand-50 text-brand-700",
  SAFETY_REJECTED: "bg-coral-100 text-coral-600",
  WAYBILL_GENERATED: "bg-forest/10 text-forest-700",
  OVERLOAD_PENDING: "bg-coral-100 text-coral-600",
  OVERLOAD_APPROVED: "bg-brand-100 text-brand-700",
  OVERLOAD_REJECTED: "bg-coral-100 text-coral-600",
  GATE_CLEARED: "bg-brand text-white",
};

export const DEFAULT_CHECKLIST = [
  "Fire extinguisher present & charged",
  "No fuel/oil leaks observed",
  "Tyres in good condition",
  "Brake lights & indicators working",
  "Driver has valid license & PPE",
  "Cargo area clean and secure",
  "Earthing/bonding cable available",
];

// Sidebar navigation registry (key -> destination + label + icon key).
export const NAV_ITEMS = {
  home: { to: "/dashboard", label: "Home", icon: "home" },
  tickets: { to: "/tickets", label: "Tickets", icon: "tickets" },
  create: { to: "/tickets/new", label: "New Ticket", icon: "create" },
  trucks: { to: "/trucks", label: "Trucks", icon: "trucks" },
  safety: { to: "/safety", label: "Safety Queue", icon: "safety" },
  dispatch: { to: "/dispatch", label: "Dispatch", icon: "dispatch" },
  overloads: { to: "/overloads", label: "Overloads", icon: "overloads" },
  gate: { to: "/gate", label: "Gate Clearance", icon: "gate" },
  staff: { to: "/staff", label: "Staff Management", icon: "staff" },
  marketers: { to: "/marketers", label: "Marketers’ Records", icon: "marketers" },
  reports: { to: "/reports", label: "Reports", icon: "reports" },
  support: { to: "/support", label: "Support", icon: "support" },
  settings: { to: "/settings", label: "Settings", icon: "settings" },
  audit: { to: "/audit", label: "Audit Log", icon: "audit" },
};

// Which sidebar links each role sees, in order.
export const ROLE_NAV = {
  ADMIN: ["home", "audit", "staff", "marketers", "reports", "support", "settings"],
  LOGISTICS: ["home", "tickets", "create", "trucks", "support", "settings"],
  SAFETY: ["home", "safety", "support", "settings"],
  DISPATCH: ["home", "dispatch", "tickets", "support", "settings"],
  GATE: ["home", "gate", "support", "settings"],
  DRIVER: ["home", "tickets", "support"],
};

// Friendly role names for the sidebar subtitle + topbar.
export const ROLE_LABELS = {
  LOGISTICS: "Logistics",
  SAFETY: "Safety",
  DISPATCH: "Dispatch",
  GATE: "Gate",
  ADMIN: "Admin",
  DRIVER: "Driver",
};
