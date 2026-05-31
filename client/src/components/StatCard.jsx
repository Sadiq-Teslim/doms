// Operations-overview metric card (BOVAS dashboard style).
export default function StatCard({ Icon, label, value, sub }) {
  return (
    <div className="flex flex-1 flex-col gap-6 rounded-[12px] border border-[#E6E1D9] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#FFF8E2] text-[#FDB706]">
          {Icon && <Icon size={20} />}
        </div>
        <span className="text-[16px] text-[#6B665E]">{label}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-[32px] font-semibold leading-none text-[#2D2922]">{value}</span>
        {sub && <span className="text-[14px] font-light text-[#6B665E]">{sub}</span>}
      </div>
    </div>
  );
}
