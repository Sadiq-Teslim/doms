import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import { IconChevronDown } from "../components/Icons.jsx";

const TABS = [
  { label: "All", value: "all" },
  { label: "Internal", value: "internal" },
  { label: "Marketer", value: "marketer" },
  { label: "Industrial", value: "industrial" },
];
const STATUS_DOT = { Completed: "bg-[#1E7E34]", Pending: "bg-[#A57506]", Failed: "bg-[#E1251B]" };
const SORT_OPTIONS = [
  { label: "Newest first", value: "date_desc" },
  { label: "Oldest first", value: "date_asc" },
  { label: "Quantity: High to Low", value: "qty_desc" },
  { label: "Quantity: Low to High", value: "qty_asc" },
  { label: "Customer: A to Z", value: "customer_asc" },
];
const STATUS_OPTS = ["All", "Completed", "Pending", "Failed"];
const PRODUCT_OPTS = ["All", "PMS", "AGO", "DPK"];

function Search(p) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>;
}
function SortIcon(p) {
  return <svg viewBox="0 0 24 24" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" /></svg>;
}
function FilterIcon(p) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M3 5h18M6 12h12M10 19h4" /></svg>;
}

export default function AuditLog() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("week");
  const [year, setYear] = useState(null);
  const [yearOpen, setYearOpen] = useState(false);
  const [sort, setSort] = useState("date_desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0, page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);

  // Debounced fetch on any filter change.
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ tab, period, sort, page: String(page), pageSize: "10" });
      if (q) params.set("q", q);
      if (year) params.set("year", String(year));
      if (status) params.set("status", status);
      if (product) params.set("product", product);
      api.get(`/audit/loads?${params.toString()}`).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [tab, q, period, year, sort, status, product, page]);

  // Reset to page 1 when filters change.
  useEffect(() => { setPage(1); }, [tab, q, period, year, sort, status, product]);

  const { rows, total, pageSize } = data;
  const from = total === 0 ? 0 : (data.page - 1) * pageSize + 1;
  const to = Math.min(data.page * pageSize, total);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function exportCsv() {
    const head = ["Customer", "Truck Type", "Truck Number", "Product", "Quantity (Litres)", "Destination", "Status"];
    const lines = rows.map((r) => [r.customer, r.truckType, r.truckNumber, r.product, r.quantity, `"${r.destination}"`, r.status].join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const pill = "flex items-center gap-2 rounded-[12px] border-[0.5px] border-[#D1D1D1] px-4 py-1.5 text-[14px] transition";

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#2D2922]">Audit Log</h1>
          <p className="mt-0.5 text-[16px] text-[#6B665E]">Overview of loading activities</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod((p) => (p === "week" ? "all" : "week"))}
            className={`${pill} ${period === "week" ? "border-[#2D2922] bg-[#2D2922] font-medium text-white" : "text-[#6B665E]"}`}
          >
            This Week
          </button>
          <div className="relative">
            <button onClick={() => setYearOpen((v) => !v)} className={`${pill} text-[#6B665E]`}>
              {year || "2026"} <IconChevronDown size={14} />
            </button>
            {yearOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setYearOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-32 rounded-[12px] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                  {[2026, 2025, 2024].map((y) => (
                    <button key={y} onClick={() => { setYear(y); setYearOpen(false); }} className="block w-full rounded-[8px] px-3 py-2 text-left text-[14px] text-[#2D2922] hover:bg-[#FFF8E2]">{y}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={() => { setYear(null); setPeriod("all"); }} className={`${pill} text-[#6B665E]`}>
            Archive <IconChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#F1F1F1]">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`relative pb-2.5 text-[16px] transition ${tab === t.value ? "font-medium text-[#2D2922]" : "text-[#6B665E]"}`}
          >
            {t.label}
            {tab === t.value && <span className="absolute -bottom-px left-0 h-0.5 w-full rounded bg-[#FDB706]" />}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-3 py-2.5 text-[#6B665E]">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Tickets"
            className="w-full bg-transparent text-[14px] text-[#2D2922] outline-none placeholder:text-[#B7B2AA]"
          />
        </div>
        {/* Sort */}
        <div className="relative">
          <button onClick={() => setSortOpen((v) => !v)} className="flex items-center gap-2 rounded-[8px] border border-[#D1D1D1] px-4 py-2.5 text-[14px] text-[#6B665E]">
            Sort <SortIcon />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-56 rounded-[12px] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setSort(o.value); setSortOpen(false); }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] ${sort === o.value ? "bg-[#FFF8E2] text-[#A57506]" : "text-[#2D2922] hover:bg-[#FAF9F7]"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter */}
        <div className="relative">
          <button onClick={() => setFilterOpen((v) => !v)} className="relative flex items-center gap-2 rounded-[8px] border border-[#D1D1D1] px-4 py-2.5 text-[14px] text-[#6B665E]">
            Filter <FilterIcon />
            {(status || product) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#FDB706]" />}
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-64 rounded-[12px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#A39E96]">Status</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {STATUS_OPTS.map((s) => {
                    const val = s === "All" ? "" : s;
                    const active = status === val;
                    return (
                      <button key={s} onClick={() => setStatus(val)} className={`rounded-full px-3 py-1 text-[13px] transition ${active ? "bg-[#FDB706] text-black" : "border border-[#D1D1D1] text-[#6B665E] hover:bg-[#FAF9F7]"}`}>{s}</button>
                    );
                  })}
                </div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#A39E96]">Product</p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_OPTS.map((p) => {
                    const val = p === "All" ? "" : p;
                    const active = product === val;
                    return (
                      <button key={p} onClick={() => setProduct(val)} className={`rounded-full px-3 py-1 text-[13px] transition ${active ? "bg-[#FDB706] text-black" : "border border-[#D1D1D1] text-[#6B665E] hover:bg-[#FAF9F7]"}`}>{p}</button>
                    );
                  })}
                </div>
                {(status || product) && (
                  <button onClick={() => { setStatus(""); setProduct(""); }} className="mt-4 text-[13px] font-medium text-[#A57506] hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <button onClick={exportCsv} className="rounded-[8px] bg-[#FDB706] px-5 py-2.5 text-[14px] font-medium text-black transition hover:brightness-95">
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="bg-[#F1F1F1] text-left text-[14px] font-medium text-[#6B665E]">
              <th className="w-10 rounded-l-md py-2.5 pl-4"></th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Truck Type</th>
              <th className="px-4 py-2.5">Truck Number</th>
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5 text-right">Quantity</th>
              <th className="rounded-r-md px-4 py-2.5">Destination</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-[14px] text-[#A39E96]">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-[14px] text-[#A39E96]">No loading activities found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/audit/${r.id}`)}
                  className="cursor-pointer border-b border-[#F1F1F1] text-[16px] text-[#2D2922] transition hover:bg-[#FAF9F7]"
                >
                  <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="h-4 w-4 rounded-[2px] border-[#6B665E] accent-[#FDB706]" />
                  </td>
                  <td className="px-4 py-3 font-medium">{r.customer}</td>
                  <td className="px-4 py-3">{r.truckType}</td>
                  <td className="px-4 py-3">{r.truckNumber}</td>
                  <td className="px-4 py-3">{r.product}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{r.quantity.toLocaleString()} Litres</td>
                  <td className="max-w-[300px] truncate px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[r.status]}`} title={r.status} />
                      {r.destination}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1 text-[14px] text-[#6B665E]">
        <button disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-1 disabled:opacity-40">
          ‹ Previous
        </button>
        <span>Showing {from}-{to} of {total} Loaded trucks</span>
        <button disabled={data.page >= pages} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 disabled:opacity-40">
          Next ›
        </button>
      </div>
    </div>
  );
}
