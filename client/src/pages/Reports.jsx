import { useEffect, useState } from "react";
import api from "../api.js";

const TABS = [
  { label: "All", value: "all" },
  { label: "Internal", value: "internal" },
  { label: "Marketer", value: "marketer" },
  { label: "Industrial", value: "industrial" },
];
const SORT_OPTIONS = [
  { label: "Newest first", value: "date_desc" },
  { label: "Oldest first", value: "date_asc" },
  { label: "Quantity: High to Low", value: "qty_desc" },
  { label: "Quantity: Low to High", value: "qty_asc" },
  { label: "Customer: A to Z", value: "customer_asc" },
];
const STATUS_OPTS = ["All", "Completed", "Pending", "Failed"];
const PRODUCT_OPTS = ["All", "PMS", "AGO", "DPK"];

const litres = (n) => (n == null ? "—" : `${Number(n).toLocaleString()} Litres`);
const time = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—");

function SearchIcon(p) { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>; }
function SortIcon(p) { return <svg viewBox="0 0 24 24" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" /></svg>; }
function FilterIcon(p) { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M3 5h18M6 12h12M10 19h4" /></svg>; }

function SummaryCard({ label, value, sub, tone }) {
  return (
    <div className={`flex flex-1 flex-col gap-6 rounded-[12px] border-[0.5px] p-4 ${tone.box}`}>
      <span className={`text-[16px] ${tone.label}`}>{label}</span>
      <div className="flex flex-col gap-1">
        <span className={`text-[32px] font-semibold leading-none ${tone.value}`}>{value}</span>
        {sub && <span className="text-[14px] font-light text-[#6B665E]">{sub}</span>}
      </div>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0, page: 1, pageSize: 10, summary: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ tab, sort, page: String(page), pageSize: "10" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (product) params.set("product", product);
      api.get(`/reports/activity?${params.toString()}`).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [tab, q, sort, status, product, page]);

  useEffect(() => { setPage(1); }, [tab, q, sort, status, product]);

  const { rows, total, pageSize, summary } = data;
  const from = total === 0 ? 0 : (data.page - 1) * pageSize + 1;
  const to = Math.min(data.page * pageSize, total);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const lastGen = summary.lastGeneratedAt ? `Last generated: ${time(summary.lastGeneratedAt)}` : null;
  const variance = summary.variance ?? 0;

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <div>
        <h1 className="text-[24px] font-semibold text-[#2D2922]">Activity Reports</h1>
        <p className="mt-0.5 text-[16px] text-[#6B665E]">Overview of today&rsquo;s loading activities</p>
      </div>

      {/* Summary cards */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <SummaryCard label="Total Amount Requested" value={litres(summary.requested)} sub={lastGen}
          tone={{ box: "border-[#FBBD30] bg-[#FFF8E1]", label: "text-[#6B665E]", value: "text-[#2D2922]" }} />
        <SummaryCard label="Total Amount Loaded" value={litres(summary.loaded)} sub={lastGen}
          tone={{ box: "border-[#4CD556] bg-[#E8F5E9]", label: "text-[#747F74]", value: "text-[#1B5E20]" }} />
        <SummaryCard label="Variance" value={`${variance > 0 ? "+" : ""}${litres(variance)}`}
          tone={{ box: "border-[#FF9595] bg-[#FDECEC]", label: "text-[#DB3838]", value: "text-[#FF0000]" }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#F1F1F1]">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`relative pb-2.5 text-[16px] ${tab === t.value ? "font-medium text-[#2D2922]" : "text-[#6B665E]"}`}>
            {t.label}
            {tab === t.value && <span className="absolute -bottom-px left-0 h-0.5 w-full rounded bg-[#FDB706]" />}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-3 py-2.5 text-[#6B665E]">
          <SearchIcon />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Tickets" className="w-full bg-transparent text-[14px] text-[#2D2922] outline-none placeholder:text-[#B7B2AA]" />
        </div>
        <div className="relative">
          <button onClick={() => setSortOpen((v) => !v)} className="flex items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-4 py-2.5 text-[14px] text-[#6B665E]">Sort <SortIcon /></button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-56 rounded-[12px] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                {SORT_OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }} className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] ${sort === o.value ? "bg-[#FFF8E2] text-[#A57506]" : "text-[#2D2922] hover:bg-[#FAF9F7]"}`}>{o.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setFilterOpen((v) => !v)} className="relative flex items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-4 py-2.5 text-[14px] text-[#6B665E]">
            Filter <FilterIcon />
            {(status || product) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#FDB706]" />}
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-64 rounded-[12px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#A39E96]">Status</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {STATUS_OPTS.map((s) => { const val = s === "All" ? "" : s; return <button key={s} onClick={() => setStatus(val)} className={`rounded-full px-3 py-1 text-[13px] ${status === val ? "bg-[#FDB706] text-black" : "border border-[#D1D1D1] text-[#6B665E]"}`}>{s}</button>; })}
                </div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#A39E96]">Product</p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_OPTS.map((p) => { const val = p === "All" ? "" : p; return <button key={p} onClick={() => setProduct(val)} className={`rounded-full px-3 py-1 text-[13px] ${product === val ? "bg-[#FDB706] text-black" : "border border-[#D1D1D1] text-[#6B665E]"}`}>{p}</button>; })}
                </div>
                {(status || product) && <button onClick={() => { setStatus(""); setProduct(""); }} className="mt-4 text-[13px] font-medium text-[#A57506] hover:underline">Clear filters</button>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px] border-collapse">
          <thead>
            <tr className="bg-[#F1F1F1] text-left text-[14px] font-medium text-[#6B665E]">
              <th className="rounded-l-md px-4 py-2.5">Loading Ticket ID</th>
              <th className="px-4 py-2.5">Waybill ID</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Truck Type</th>
              <th className="px-4 py-2.5">Truck Number</th>
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5 text-right">Requested Quantity</th>
              <th className="px-4 py-2.5 text-right">Quantity Loaded</th>
              <th className="px-4 py-2.5">Destination</th>
              <th className="px-4 py-2.5">Time In</th>
              <th className="rounded-r-md px-4 py-2.5">Time Out</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="py-10 text-center text-[14px] text-[#A39E96]">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={11} className="py-10 text-center text-[14px] text-[#A39E96]">No activity found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[#F1F1F1] text-[16px] text-[#2D2922]">
                  <td className="px-4 py-3">{r.loadingTicketId}</td>
                  <td className="px-4 py-3">{r.waybillId || "—"}</td>
                  <td className="px-4 py-3">{r.customer}</td>
                  <td className="px-4 py-3">{r.truckType}</td>
                  <td className="px-4 py-3">{r.truckNumber}</td>
                  <td className="px-4 py-3">{r.product}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{litres(r.requested)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{litres(r.loaded)}</td>
                  <td className="max-w-[280px] truncate px-4 py-3">{r.destination}</td>
                  <td className="px-4 py-3">{time(r.timeIn)}</td>
                  <td className="px-4 py-3">{time(r.timeOut)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1 text-[14px] text-[#6B665E]">
        <button disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">‹ Previous</button>
        <span>Showing {from}-{to} of {total} Loaded trucks</span>
        <button disabled={data.page >= pages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">Next ›</button>
      </div>
    </div>
  );
}
