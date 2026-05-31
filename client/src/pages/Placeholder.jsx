import { NAV_ICONS } from "../components/Icons.jsx";

// Lightweight "coming soon" page for nav destinations not yet built out.
export default function Placeholder({ title, icon, blurb }) {
  const Icon = NAV_ICONS[icon];
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#FFF8E2] text-[#FDB706]">
        {Icon && <Icon size={30} />}
      </div>
      <h1 className="mt-6 text-[24px] font-semibold text-[#2D2922]">{title}</h1>
      <p className="mt-2 text-[14px] text-[#6B665E]">
        {blurb || "This section is coming soon."}
      </p>
      <span className="mt-6 rounded-full bg-[#FFF8E2] px-4 py-1.5 text-[12px] font-medium text-[#A57506]">
        In design
      </span>
    </div>
  );
}
