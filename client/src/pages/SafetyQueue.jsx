import { useEffect, useState } from "react";
import api from "../api.js";
import { DEFAULT_CHECKLIST } from "../constants.js";

function InspectModal({ ticket, onClose, onDone }) {
  const [items, setItems] = useState(
    DEFAULT_CHECKLIST.map((item) => ({ item, ok: true, note: "" }))
  );
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggle(i) {
    setItems((arr) => arr.map((c, idx) => (idx === i ? { ...c, ok: !c.ok } : c)));
  }
  function setNote(i, note) {
    setItems((arr) => arr.map((c, idx) => (idx === i ? { ...c, note } : c)));
  }

  async function submit(result) {
    setBusy(true);
    setError("");
    try {
      await api.post(`/tickets/${ticket.id}/inspect`, { checklist: items, result, remarks });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
      setBusy(false);
    }
  }

  const allOk = items.every((c) => c.ok);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <h2 className="text-xl font-bold">Safety Inspection</h2>
        <p className="mb-4 text-sm text-gray-500">
          {ticket.ticketNumber} · {ticket.truck?.plateNumber} · {ticket.product}
        </p>

        <div className="space-y-2">
          {items.map((c, i) => (
            <div key={i} className="rounded-xl border border-ink/10 p-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={c.ok}
                  onChange={() => toggle(i)}
                  className="h-5 w-5 rounded"
                />
                <span className={`text-sm ${c.ok ? "text-gray-800" : "text-red-600"}`}>{c.item}</span>
              </label>
              {!c.ok && (
                <input
                  className="input mt-2"
                  placeholder="Issue note…"
                  value={c.note}
                  onChange={(e) => setNote(i, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="label">Remarks</label>
          <textarea className="input" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {!allOk && (
          <p className="mt-2 text-sm font-medium text-gold-600">Some checks failed — you can still approve or reject.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn-danger" onClick={() => submit("REJECTED")} disabled={busy}>
            Reject
          </button>
          <button className="btn-success" onClick={() => submit("APPROVED")} disabled={busy}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SafetyQueue() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/tickets", { params: { status: "PENDING_SAFETY" } });
    setTickets(res.data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Safety Inspection Queue</h1>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className="card text-center text-gray-400">No tickets awaiting inspection. 🎉</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{t.ticketNumber}</div>
                  <div className="text-sm text-gray-500">{t.truck?.plateNumber} · {t.truck?.driverName}</div>
                </div>
                <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Product:</span> {t.product}</div>
                <div><span className="text-gray-500">Qty:</span> {t.requestedQtyTons}t</div>
                <div><span className="text-gray-500">Customer:</span> {t.customer}</div>
                <div><span className="text-gray-500">Dest:</span> {t.destination}</div>
              </dl>
              <button className="btn-primary mt-4 w-full" onClick={() => setActive(t)}>
                Start Inspection
              </button>
            </div>
          ))}
        </div>
      )}

      {active && (
        <InspectModal
          ticket={active}
          onClose={() => setActive(null)}
          onDone={() => {
            setActive(null);
            load();
          }}
        />
      )}
    </div>
  );
}
