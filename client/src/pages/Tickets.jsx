import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { STATUS_LABELS } from "../constants.js";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tickets")
      .then((res) => setTickets(res.data))
      .finally(() => setLoading(false));
  }, []);

  const shown = filter ? tickets.filter((t) => t.status === filter) : tickets;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tickets</h1>
          <p className="mt-1 text-sm text-ink-400">All loading tickets across the workflow.</p>
        </div>
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="border-b border-ink/[0.07] bg-cream-100">
            <tr>
              <th className="th">Ticket #</th>
              <th className="th">Truck</th>
              <th className="th">Product</th>
              <th className="th">Customer</th>
              <th className="th">Destination</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.05]">
            {loading ? (
              <tr><td className="td" colSpan={7}>Loading…</td></tr>
            ) : shown.length === 0 ? (
              <tr><td className="td text-ink-400" colSpan={7}>No tickets found.</td></tr>
            ) : (
              shown.map((t) => (
                <tr key={t.id} className="transition hover:bg-cream-100">
                  <td className="td font-semibold text-ink">{t.ticketNumber}</td>
                  <td className="td">{t.truck?.plateNumber}</td>
                  <td className="td">{t.product}</td>
                  <td className="td">{t.customer}</td>
                  <td className="td">{t.destination}</td>
                  <td className="td"><StatusBadge status={t.status} /></td>
                  <td className="td">
                    <Link to={`/tickets/${t.id}`} className="font-semibold text-brand hover:underline">
                      View
                    </Link>
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
