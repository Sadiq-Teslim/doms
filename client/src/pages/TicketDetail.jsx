import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { openPdf } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { IconArrowLeft, IconFile } from "../components/Icons.jsx";

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value == null || value === "" ? "—" : value}</dd>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  async function load() {
    const res = await api.get(`/tickets/${id}`);
    setTicket(res.data);
  }
  useEffect(() => {
    load();
  }, [id]);

  if (!ticket) return <p className="text-gray-500">Loading…</p>;

  const wb = ticket.waybill;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-brand">
            <IconArrowLeft size={16} /> Back to tickets
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink">{ticket.ticketNumber}</h1>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => openPdf(`/tickets/${id}/ticket.pdf`)}>
          <IconFile size={17} /> Ticket PDF
        </button>
        {wb && (
          <button className="btn-ghost" onClick={() => openPdf(`/tickets/${id}/waybill.pdf`)}>
            <IconFile size={17} /> Waybill PDF
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Load Details</h2>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Row label="Truck" value={ticket.truck?.plateNumber} />
          <Row label="Driver" value={ticket.truck?.driverName} />
          <Row label="Capacity" value={`${ticket.truck?.capacityTons} t`} />
          <Row label="Product" value={ticket.product} />
          <Row label="Requested Qty" value={`${ticket.requestedQtyTons} t`} />
          <Row label="Customer" value={ticket.customer} />
          <Row label="Destination" value={ticket.destination} />
          <Row label="Created By" value={ticket.createdBy?.name} />
          <Row label="Created At" value={new Date(ticket.createdAt).toLocaleString()} />
        </dl>
        {ticket.notes && <p className="mt-4 text-sm text-gray-600">Notes: {ticket.notes}</p>}
      </div>

      {ticket.inspection && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Safety Inspection</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Row label="Result" value={ticket.inspection.result} />
            <Row label="Inspector" value={ticket.inspection.inspector?.name} />
            <Row label="Inspected At" value={new Date(ticket.inspection.inspectedAt).toLocaleString()} />
            <Row label="Remarks" value={ticket.inspection.remarks} />
          </dl>
          {Array.isArray(ticket.inspection.checklist) && ticket.inspection.checklist.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {ticket.inspection.checklist.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span>{c.ok ? "✅" : "❌"}</span>
                  <span>{c.item}</span>
                  {c.note && <span className="text-gray-400">— {c.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {wb && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Waybill</h2>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Row label="Waybill #" value={wb.waybillNumber} />
            <Row label="Loaded Qty" value={`${wb.loadedQtyTons} t`} />
            <Row label="Dispatched By" value={wb.dispatchedBy?.name} />
            <Row label="Overload" value={wb.overload ? `Yes (${wb.overloadStatus})` : "No"} />
          </dl>
          {wb.overloadReview && (
            <p className="mt-3 text-sm text-gray-600">
              Overload {wb.overloadReview.decision.toLowerCase()} — {wb.overloadReview.reason || "no reason given"}
            </p>
          )}
        </div>
      )}

      {ticket.gateClearance && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Gate Clearance</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Row label="Cleared By" value={ticket.gateClearance.clearedBy?.name} />
            <Row label="Exited At" value={new Date(ticket.gateClearance.exitedAt).toLocaleString()} />
            <Row label="Notes" value={ticket.gateClearance.notes} />
          </dl>
        </div>
      )}
    </div>
  );
}
