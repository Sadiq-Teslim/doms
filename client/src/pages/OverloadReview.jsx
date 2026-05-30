import { useEffect, useState } from "react";
import api from "../api.js";

export default function OverloadReview() {
  const [waybills, setWaybills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await api.get("/overloads/pending");
    setWaybills(res.data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function review(id, decision) {
    setBusyId(id);
    try {
      await api.post(`/overloads/${id}/review`, { decision, reason: reasons[id] || "" });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Overload Approvals</h1>
      <p className="text-sm text-gray-500">Waybills where loaded quantity exceeds truck capacity.</p>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : waybills.length === 0 ? (
        <div className="card text-center text-gray-400">No pending overload requests. ✅</div>
      ) : (
        <div className="space-y-4">
          {waybills.map((w) => {
            const cap = w.ticket?.truck?.capacityTons;
            const over = (w.loadedQtyTons - cap).toFixed(1);
            return (
              <div key={w.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{w.waybillNumber} · {w.ticket?.ticketNumber}</div>
                    <div className="text-sm text-gray-500">
                      {w.ticket?.truck?.plateNumber} · {w.ticket?.product} → {w.ticket?.destination}
                    </div>
                  </div>
                  <div className="rounded-xl bg-coral-100 px-3 py-1.5 text-sm font-semibold text-coral-600">
                    Loaded {w.loadedQtyTons}t / Capacity {cap}t (+{over}t)
                  </div>
                </div>
                <input
                  className="input mt-3"
                  placeholder="Reason / note (optional)"
                  value={reasons[w.id] || ""}
                  onChange={(e) => setReasons((r) => ({ ...r, [w.id]: e.target.value }))}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button className="btn-danger" disabled={busyId === w.id} onClick={() => review(w.id, "REJECTED")}>
                    Reject
                  </button>
                  <button className="btn-success" disabled={busyId === w.id} onClick={() => review(w.id, "APPROVED")}>
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
