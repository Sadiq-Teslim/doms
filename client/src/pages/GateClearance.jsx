import { useEffect, useState } from "react";
import api, { openPdf } from "../api.js";

function ClearModal({ ticket, onClose, onDone }) {
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api.post(`/gate/${ticket.id}/clear`, { pin, notes });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 className="text-xl font-bold">Confirm Truck Exit</h2>
        <p className="mb-4 text-sm text-gray-500">
          {ticket.ticketNumber} · {ticket.truck?.plateNumber} · {ticket.truck?.driverName}
        </p>

        <div className="mb-4 rounded-xl bg-cream-100 p-3 text-sm">
          <div>Waybill: <b>{ticket.waybill?.waybillNumber}</b></div>
          <div>Loaded: <b>{ticket.waybill?.loadedQtyTons}t</b></div>
        </div>

        <label className="label">Security PIN</label>
        <input
          className="input text-center text-2xl tracking-widest"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
        />
        <label className="label mt-3">Notes (optional)</label>
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn-success" onClick={submit} disabled={busy || !pin}>
            {busy ? "Verifying…" : "Confirm Exit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GateClearance() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/gate/queue");
    setTickets(res.data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gate Clearance</h1>
      <p className="text-sm text-gray-500">Trucks with valid waybills ready to exit. Verify documents, then confirm with PIN.</p>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className="card text-center text-gray-400">No trucks waiting for clearance.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">{t.truck?.plateNumber}</div>
                  <div className="text-sm text-gray-500">{t.truck?.driverName}</div>
                </div>
                <span className="chip bg-forest/10 text-forest-700">
                  {t.waybill?.waybillNumber}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Ticket:</span> {t.ticketNumber}</div>
                <div><span className="text-gray-500">Product:</span> {t.product}</div>
                <div><span className="text-gray-500">Loaded:</span> {t.waybill?.loadedQtyTons}t</div>
                <div><span className="text-gray-500">Dest:</span> {t.destination}</div>
              </dl>
              <div className="mt-4 flex gap-2">
                <button className="btn-success flex-1" onClick={() => setActive(t)}>
                  Clear for Exit
                </button>
                <button className="btn-ghost" onClick={() => openPdf(`/tickets/${t.id}/waybill.pdf`)}>
                  📄
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <ClearModal
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
