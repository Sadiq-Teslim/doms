import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [form, setForm] = useState({
    truckId: "",
    product: "",
    requestedQtyTons: "",
    destination: "",
    customer: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/trucks").then((res) => setTrucks(res.data));
  }, []);

  // Smart autofill: when a truck is chosen, prefill its default product.
  function selectTruck(id) {
    const truck = trucks.find((t) => String(t.id) === String(id));
    setForm((f) => ({
      ...f,
      truckId: id,
      product: f.product || truck?.defaultProduct || "",
    }));
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/tickets", {
        ...form,
        truckId: Number(form.truckId),
        requestedQtyTons: Number(form.requestedQtyTons),
      });
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create ticket");
    } finally {
      setBusy(false);
    }
  }

  const selectedTruck = trucks.find((t) => String(t.id) === String(form.truckId));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">New Loading Ticket</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">Truck</label>
          <select className="input" value={form.truckId} onChange={(e) => selectTruck(e.target.value)} required>
            <option value="">Select a truck…</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.plateNumber} — {t.driverName} ({t.capacityTons}t)
              </option>
            ))}
          </select>
          {selectedTruck && (
            <p className="mt-1 text-xs text-gray-500">
              Driver: {selectedTruck.driverName} · Transporter: {selectedTruck.transporter || "—"} · Capacity:{" "}
              {selectedTruck.capacityTons}t
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Product</label>
            <input className="input" value={form.product} onChange={(e) => set("product", e.target.value)} required />
          </div>
          <div>
            <label className="label">Requested Quantity (tons)</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.requestedQtyTons}
              onChange={(e) => set("requestedQtyTons", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Customer</label>
            <input className="input" value={form.customer} onChange={(e) => set("customer", e.target.value)} required />
          </div>
          <div>
            <label className="label">Destination</label>
            <input className="input" value={form.destination} onChange={(e) => set("destination", e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Creating…" : "Create Ticket"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate("/tickets")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
