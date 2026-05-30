// Lightweight inline SVG icons (stroke style). size via `className` (w/h) or `size`.
function Svg({ size = 20, className = "", children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconGrid = (p) => (
  <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></Svg>
);
export const IconTicket = (p) => (
  <Svg {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V8Z" /><path d="M13 6v12" strokeDasharray="2 2" /></Svg>
);
export const IconPlus = (p) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconTruck = (p) => (
  <Svg {...p}><path d="M14 17V5a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h1" /><path d="M14 8h4l3 3v6a1 1 0 0 1-1 1h-1" /><circle cx="7.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" /></Svg>
);
export const IconShield = (p) => (
  <Svg {...p}><path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Svg>
);
export const IconBox = (p) => (
  <Svg {...p}><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Svg>
);
export const IconAlert = (p) => (
  <Svg {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></Svg>
);
export const IconBarrier = (p) => (
  <Svg {...p}><path d="M4 21V8M20 21V8" /><path d="M3 8h18l-2-4H5L3 8Z" /><path d="M7 12h10M7 16h10" /></Svg>
);
export const IconUsers = (p) => (
  <Svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></Svg>
);
export const IconScroll = (p) => (
  <Svg {...p}><path d="M5 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2Z" /><path d="M9 8h6M9 12h6M9 16h3" /></Svg>
);
export const IconBell = (p) => (
  <Svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Svg>
);
export const IconLogout = (p) => (
  <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></Svg>
);
export const IconFile = (p) => (
  <Svg {...p}><path d="M14 3v5h5" /><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5Z" /><path d="M9 13h6M9 17h6" /></Svg>
);
export const IconCheck = (p) => (
  <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
);
export const IconX = (p) => (
  <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>
);
export const IconArrowLeft = (p) => (
  <Svg {...p}><path d="m12 19-7-7 7-7M19 12H5" /></Svg>
);
export const IconArrowRight = (p) => (
  <Svg {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Svg>
);
export const IconLock = (p) => (
  <Svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>
);
export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);

export const NAV_ICONS = {
  dashboard: IconGrid,
  tickets: IconTicket,
  create: IconPlus,
  trucks: IconTruck,
  safety: IconShield,
  dispatch: IconBox,
  overloads: IconAlert,
  gate: IconBarrier,
  users: IconUsers,
  audit: IconScroll,
};
