import { useEffect, useState } from "react";
import api from "../api.js";

const EMPTY = { plateNumber: "", driverName: "", driverPhone: "", transporter: "", defaultProduct: "", capacityTons: "" };

export default function Trucks() {
  const [trucks, setTrucks] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.get("/trucks");
    setTrucks(res.data);
  }
  useEffect(() => {
    load();
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/trucks", { ...form, capacityTons: Number(form.capacityTons) });
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trucks (Master Records)</h1>

      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">Plate Number</label>
          <input className="input" value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value)} required />
        </div>
        <div>
          <label className="label">Driver Name</label>
          <input className="input" value={form.driverName} onChange={(e) => set("driverName", e.target.value)} required />
        </div>
        <div>
          <label className="label">Driver Phone</label>
          <input className="input" value={form.driverPhone} onChange={(e) => set("driverPhone", e.target.value)} />
        </div>
        <div>
          <label className="label">Transporter</label>
          <input className="input" value={form.transporter} onChange={(e) => set("transporter", e.target.value)} />
        </div>
        <div>
          <label className="label">Default Product</label>
          <input className="input" value={form.defaultProduct} onChange={(e) => set("defaultProduct", e.target.value)} />
        </div>
        <div>
          <label className="label">Capacity (tons)</label>
          <input className="input" type="number" step="0.1" value={form.capacityTons} onChange={(e) => set("capacityTons", e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}
        <div className="md:col-span-3">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Add Truck"}
          </button>
        </div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b bg-cream-100">
            <tr>
              <th className="th">Plate</th>
              <th className="th">Driver</th>
              <th className="th">Phone</th>
              <th className="th">Transporter</th>
              <th className="th">Default Product</th>
              <th className="th">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {trucks.map((t) => (
              <tr key={t.id} className="hover:bg-cream-100">
                <td className="td font-medium">{t.plateNumber}</td>
                <td className="td">{t.driverName}</td>
                <td className="td">{t.driverPhone || "—"}</td>
                <td className="td">{t.transporter || "—"}</td>
                <td className="td">{t.defaultProduct || "—"}</td>
                <td className="td">{t.capacityTons}t</td>
              </tr>
            ))}
            {trucks.length === 0 && (
              <tr><td className="td text-gray-400" colSpan={6}>No trucks yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
