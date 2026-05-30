import { useEffect, useState } from "react";
import api from "../api.js";

const ROLES = ["LOGISTICS", "SAFETY", "DISPATCH", "GATE", "ADMIN", "DRIVER"];
const EMPTY = { name: "", email: "", password: "", role: "LOGISTICS", pin: "" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.get("/users");
    setUsers(res.data);
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
      const payload = { ...form };
      if (!payload.pin) delete payload.pin;
      await api.post("/users", payload);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u) {
    if (u.active) {
      await api.delete(`/users/${u.id}`);
    } else {
      await api.patch(`/users/${u.id}`, { active: true });
    }
    load();
  }

  async function setPin(u) {
    const pin = prompt(`Set new PIN for ${u.name} (digits only, blank to clear):`);
    if (pin === null) return;
    await api.patch(`/users/${u.id}`, { pin });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" value={form.password} onChange={(e) => set("password", e.target.value)} required />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">PIN (for Gate, optional)</label>
          <input className="input" value={form.pin} onChange={(e) => set("pin", e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}
        <div className="md:col-span-3">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Add User"}
          </button>
        </div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b bg-cream-100">
            <tr>
              <th className="th">Name</th>
              <th className="th">Email</th>
              <th className="th">Role</th>
              <th className="th">PIN</th>
              <th className="th">Status</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-cream-100">
                <td className="td font-medium">{u.name}</td>
                <td className="td">{u.email}</td>
                <td className="td">{u.role}</td>
                <td className="td">{u.hasPin ? "✓ set" : "—"}</td>
                <td className="td">
                  <span className={`chip ${u.active ? "bg-brand-50 text-brand-700" : "bg-ink/5 text-ink-400"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="td">
                  <div className="flex gap-3">
                    <button className="font-semibold text-brand hover:underline" onClick={() => setPin(u)}>
                      Set PIN
                    </button>
                    <button className="font-semibold text-ink-500 hover:underline" onClick={() => toggleActive(u)}>
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
