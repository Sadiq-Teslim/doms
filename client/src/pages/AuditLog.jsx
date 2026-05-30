import { useEffect, useState } from "react";
import api from "../api.js";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/audit")
      .then((res) => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b bg-cream-100">
            <tr>
              <th className="th">Time</th>
              <th className="th">Actor</th>
              <th className="th">Action</th>
              <th className="th">Entity</th>
              <th className="th">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="td" colSpan={5}>Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td className="td text-gray-400" colSpan={5}>No audit entries.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-cream-100">
                  <td className="td whitespace-nowrap text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="td">{l.actor ? `${l.actor.name} (${l.actor.role})` : "System"}</td>
                  <td className="td"><span className="rounded-md bg-forest/8 px-2 py-1 text-xs font-semibold text-forest-700">{l.action}</span></td>
                  <td className="td">{l.entity} #{l.entityId}</td>
                  <td className="td text-xs text-gray-500">
                    {l.details ? JSON.stringify(l.details) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
