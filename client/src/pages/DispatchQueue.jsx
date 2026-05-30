import { useEffect, useState } from "react";
import api, { openPdf } from "../api.js";

function WaybillModal({ ticket, onClose, onDone }) {
  const [qty, setQty] = useState(ticket.requestedQtyTons);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const overload = Number(qty) > ticket.truck?.capacityTons;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api.post(`/tickets/${ticket.id}/waybill`, { loadedQtyTons: Number(qty) });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 className="text-xl font-bold">Generate Waybill</h2>
        <p className="mb-4 text-sm text-gray-500">
          {ticket.ticketNumber} · {ticket.truck?.plateNumber} · capacity {ticket.truck?.capacityTons}t
        </p>
        <label className="label">Loaded Quantity (tons)</label>
        <input
          className="input"
          type="number"
          step="0.1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        {overload && (
          <p className="mt-2 rounded-xl bg-coral-100 px-3 py-2 text-sm font-medium text-coral-600">
            ⚠️ Exceeds capacity ({ticket.truck?.capacityTons}t) — this will be escalated to Admin for overload approval.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? "Generating…" : "Generate Waybill"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DispatchQueue() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/tickets", { params: { status: "SAFETY_APPROVED" } });
    setTickets(res.data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dispatch Queue</h1>
      <p className="text-sm text-gray-500">Safety-approved tickets ready for loading & waybill generation.</p>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className="card text-center text-gray-400">No approved tickets waiting.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((t) => (
            <div key={t.id} className="card">
              <div className="font-semibold">{t.ticketNumber}</div>
              <div className="text-sm text-gray-500">{t.truck?.plateNumber} · {t.product}</div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Requested:</span> {t.requestedQtyTons}t</div>
                <div><span className="text-gray-500">Capacity:</span> {t.truck?.capacityTons}t</div>
                <div><span className="text-gray-500">Customer:</span> {t.customer}</div>
                <div><span className="text-gray-500">Dest:</span> {t.destination}</div>
              </dl>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary flex-1" onClick={() => setActive(t)}>
                  Generate Waybill
                </button>
                <button className="btn-ghost" onClick={() => openPdf(`/tickets/${t.id}/ticket.pdf`)}>
                  📄
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <WaybillModal
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
