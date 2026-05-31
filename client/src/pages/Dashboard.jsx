import { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import BarChart from "../components/BarChart.jsx";
import { IconTicket, IconClock, IconBadgeCheck, IconTruck, IconUpload, IconChevronDown } from "../components/Icons.jsx";

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function formatToday() {
  const d = new Date();
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${ordinal(d.getDate())} ${month}, ${d.getFullYear()}`;
}
function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function shortName(name = "") {
  const first = name.split(" ")[0].toUpperCase();
  return first.length > 8 ? first.slice(0, 7) + "…" : first;
}

const PERIODS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "All time", value: "all" },
];

// Compact filter dropdown (matches the BOVAS pill style).
function Dropdown({ value, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[12px] border-[0.5px] border-[#6B665E] px-4 py-1.5 text-[14px] text-[#2D2922] transition hover:bg-black/[0.03]"
      >
        {selected ? selected.label : placeholder}
        <IconChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 max-h-60 w-44 overflow-y-auto rounded-[12px] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`block w-full truncate rounded-[8px] px-3 py-2 text-left text-[14px] transition hover:bg-[#FFF8E2] ${
                  o.value === value ? "text-[#A57506]" : "text-[#2D2922]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, metric, color }) {
  const [product, setProduct] = useState("");
  const [period, setPeriod] = useState("daily");
  const [resp, setResp] = useState({ products: [], perMarketer: [] });

  useEffect(() => {
    const params = new URLSearchParams();
    if (product) params.set("product", product);
    params.set("period", period);
    api.get(`/stats/marketers?${params.toString()}`).then((r) => setResp(r.data)).catch(() => {});
  }, [product, period]);

  const productOptions = [{ label: "All Products", value: "" }, ...(resp.products || []).map((p) => ({ label: p, value: p }))];
  const data = (resp.perMarketer || []).map((x) => ({
    label: shortName(x.name),
    value: metric === "quantity" ? Math.round(x.quantity) : x.trucks,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 rounded-[8px] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-[#2D2922]">{title}</h3>
        <div className="flex items-center gap-3">
          <Dropdown value={product} options={productOptions} placeholder="Product" onChange={setProduct} />
          <Dropdown value={period} options={PERIODS} placeholder="Daily" onChange={setPeriod} />
        </div>
      </div>
      <BarChart data={data} color={color} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const m = stats?.metrics || {};
  const firstName = user?.name?.split(" ")[0] || "there";
  const canUpload = ["ADMIN", "LOGISTICS"].includes(user?.role);

  const cards = [
    { Icon: IconTicket, label: "Generated Tickets", value: m.generatedTickets ?? "—", sub: `Last generated: ${formatTime(m.lastGeneratedAt)}` },
    { Icon: IconClock, label: "Pending Tickets", value: m.pendingTickets ?? "—" },
    { Icon: IconBadgeCheck, label: "Approved for Loading", value: m.approvedForLoading ?? "—" },
    { Icon: IconTruck, label: "Trucks Dispatched", value: m.trucksDispatched ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#2D2922]">Welcome, {firstName}!</h1>
          <p className="mt-0.5 text-[14px] text-[#6B665E]">{formatToday()}</p>
        </div>
        {canUpload && (
          <button
            type="button"
            className="flex h-[56px] items-center justify-center gap-3 rounded-[16px] bg-[#FDB706] px-6 text-[14px] font-medium text-[#212121] transition hover:brightness-95 active:scale-[0.99]"
          >
            <IconUpload size={18} />
            Upload Loading Program
          </button>
        )}
      </div>

      <section className="space-y-5">
        <h2 className="text-[20px] font-semibold text-[#4C4841]">Operations Overview</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 lg:flex-row">
        <ChartCard title="Trucks per Marketer" metric="trucks" color="#E6D4B6" />
        <ChartCard title="Quantity Loaded per Marketer" metric="quantity" color="#E6D4B6" />
      </section>
    </div>
  );
}
