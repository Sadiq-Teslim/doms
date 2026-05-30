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

// Which sidebar links each role can see.
export const ROLE_NAV = {
  LOGISTICS: ["dashboard", "tickets", "create", "trucks"],
  SAFETY: ["dashboard", "safety"],
  DISPATCH: ["dashboard", "dispatch", "tickets"],
  GATE: ["dashboard", "gate"],
  ADMIN: ["dashboard", "tickets", "overloads", "trucks", "users", "audit"],
  DRIVER: ["dashboard", "tickets"],
};
