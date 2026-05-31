import { useEffect, useState } from "react";
import api from "../api.js";

const SORT_OPTIONS = [
  { label: "Marketer: A to Z", value: "name_asc" },
  { label: "Marketer: Z to A", value: "name_desc" },
  { label: "Representative", value: "rep_asc" },
];

function Search(p) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>;
}
function SortIcon(p) {
  return <svg viewBox="0 0 24 24" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" /></svg>;
}
function FilterIcon(p) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M3 5h18M6 12h12M10 19h4" /></svg>;
}

export default function MarketersRecords() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0, page: 1, pageSize: 12 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ sort, page: String(page), pageSize: "12" });
      if (q) params.set("q", q);
      api.get(`/marketers?${params.toString()}`).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, sort, page]);

  useEffect(() => { setPage(1); }, [q, sort]);

  const { rows, total, pageSize } = data;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageList = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <h1 className="text-[20px] font-semibold text-[#2D2922]">Marketers&rsquo; Records</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[260px] max-w-[420px] flex-1 items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-3 py-2.5 text-[#6B665E]">
          <Search />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search marketers" className="w-full bg-transparent text-[14px] text-[#2D2922] outline-none placeholder:text-[#B7B2AA]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setSortOpen((v) => !v)} className="flex items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-4 py-2.5 text-[14px] text-[#6B665E]">
              Sort <SortIcon />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-52 rounded-[12px] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }} className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] ${sort === o.value ? "bg-[#FFF8E2] text-[#A57506]" : "text-[#2D2922] hover:bg-[#FAF9F7]"}`}>{o.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="flex items-center gap-2 rounded-[12px] border border-[#D1D1D1] px-4 py-2.5 text-[14px] text-[#6B665E]">
            Filter <FilterIcon />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-[#F1F1F1] text-left text-[14px] font-medium text-[#6B665E]">
              <th className="rounded-l-md px-4 py-2.5">Marketer</th>
              <th className="px-4 py-2.5">Representative</th>
              <th className="px-4 py-2.5">Phone Number</th>
              <th className="rounded-r-md px-4 py-2.5">Email Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center text-[14px] text-[#A39E96]">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-[14px] text-[#A39E96]">No marketers found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[#F1F1F1] text-[16px] text-[#2D2922]">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.representative}</td>
                  <td className="px-4 py-3">{r.phone}</td>
                  <td className="px-4 py-3">{r.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Numbered pagination */}
      <div className="flex items-center justify-between pt-1 text-[14px] text-[#6B665E]">
        <button disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">‹ Previous</button>
        <div className="flex items-center gap-2">
          {pageList.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-[14px] transition ${p === data.page ? "bg-[#FDB706] font-medium text-black" : "text-[#6B665E] hover:bg-[#F1F1F1]"}`}
            >
              {p}
            </button>
          ))}
        </div>
        <button disabled={data.page >= pages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">Next ›</button>
      </div>
    </div>
  );
}
