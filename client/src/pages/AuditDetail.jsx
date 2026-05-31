import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api.js";
import { IconArrowLeft, IconBadgeCheck, IconAlert } from "../components/Icons.jsx";

const STATUS_BADGE = {
  Completed: "bg-[#E6F4EA] text-[#1E7E34]",
  Pending: "bg-[#FEF3CD] text-[#A57506]",
  Failed: "bg-[#FDECEA] text-[#E1251B]",
};
const litres = (n) => (n == null ? "—" : `${Number(n).toLocaleString()} Litres`);
const time = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—");

function Field({ label, value, tone }) {
  return (
    <div className={`flex min-w-[160px] flex-1 flex-col items-center justify-center gap-1.5 rounded-[12px] px-4 py-5 text-center ${tone || "border border-[#EFEAE1]"}`}>
      <span className={`text-[14px] ${tone ? "text-white/90" : "text-[#6B665E]"}`}>{label}</span>
      <span className={`text-[18px] font-semibold ${tone ? "text-white" : "text-[#2D2922]"}`}>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-[14px] border border-[#EFEAE1] bg-white p-5">
      <div className="mb-4 inline-block rounded-[8px] bg-[#F3F1ED] px-4 py-2.5 text-[16px] font-medium text-[#2D2922]">
        {title}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/audit/loads/${id}`).then((r) => setD(r.data)).catch(() => setError(true));
  }, [id]);

  if (error) return <p className="text-[14px] text-[#6B665E]">Could not load this record.</p>;
  if (!d) return <p className="text-[14px] text-[#6B665E]">Loading…</p>;

  const ls = d.loadingSummary;
  const statusTone =
    ls.overloaded ? "bg-[#E1251B]" : ls.actual != null ? "bg-[#1E7A3A]" : "border border-[#EFEAE1]";

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[16px] text-[#2D2922] hover:opacity-70">
        <IconArrowLeft size={18} /> Back
      </button>

      {/* Title + status */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-[24px] font-semibold text-[#2D2922]">{d.title}</h1>
        <span className={`rounded-[10px] px-5 py-2 text-[16px] font-semibold ${STATUS_BADGE[d.status]}`}>{d.status}</span>
      </div>

      {/* Reason banner */}
      {d.reason && (
        <div className={`flex items-center gap-3 rounded-[12px] px-5 py-4 text-[16px] font-medium ${d.status === "Failed" ? "bg-[#FDECEA] text-[#E1251B]" : "bg-[#FEF6DC] text-[#7A5B05]"}`}>
          <IconAlert size={22} />
          Reason: {d.reason}
        </div>
      )}

      {/* Truck information */}
      <Section title="Truck Information">
        <Field label="Truck Type" value={d.truck.type} />
        <Field label="Truck Number" value={d.truck.number} />
        <Field label="Product" value={d.truck.product} />
        <Field label="Capacity" value={litres(d.truck.capacity)} />
      </Section>

      {/* Loading summary */}
      <Section title="Loading Summary">
        <Field label="Requested Quantity" value={litres(ls.requested)} />
        <Field label="Actual Loaded Quantity" value={litres(ls.actual)} />
        <Field label="Variance" value={ls.variance == null ? "—" : `${ls.variance > 0 ? "+" : ""}${ls.variance.toLocaleString()} Litres`} />
        <div className={`flex min-w-[160px] flex-1 flex-col items-center justify-center gap-1.5 rounded-[12px] px-4 py-5 text-center ${statusTone}`}>
          <span className={`text-[14px] ${ls.actual != null ? "text-white/90" : "text-[#6B665E]"}`}>Status</span>
          <span className={`flex items-center gap-2 text-[18px] font-semibold ${ls.actual != null ? "text-white" : "text-[#2D2922]"}`}>
            {ls.actual == null ? (
              "Not loaded"
            ) : ls.overloaded ? (
              <><IconAlert size={18} /> Overloaded</>
            ) : (
              <><IconBadgeCheck size={18} /> Within Limit</>
            )}
          </span>
        </div>
      </Section>

      {/* Ticket details */}
      <Section title="Ticket Details">
        <Field label="Loading Ticket ID" value={d.ticketDetails.loadingTicketId} />
        {d.ticketDetails.waybillId && <Field label="Waybill ID" value={d.ticketDetails.waybillId} />}
      </Section>

      {/* Timeline */}
      <Section title="Timeline">
        <Field label="Loading Ticket Created" value={time(d.timeline.loadingTicketCreated)} />
        <Field label="Safety" value={time(d.timeline.safety)} />
        {d.timeline.waybillCreated && <Field label="Waybill Ticket Created" value={time(d.timeline.waybillCreated)} />}
        {d.timeline.gateCleared && <Field label="Gate Cleared" value={time(d.timeline.gateCleared)} />}
      </Section>

      {/* Staff on duty */}
      <Section title="Staff on Duty">
        <Field label="Logistics" value={d.staff.logistics || "—"} />
        <Field label="Safety" value={d.staff.safety || "—"} />
        <Field label="Dispatch" value={d.staff.dispatch || "—"} />
        <Field label="Gate" value={d.staff.gate || "—"} />
      </Section>

      {/* Overload approval */}
      {d.overloadApprovedBy && (
        <Section title="Overloading Approved By">
          <Field label="Admin" value={d.overloadApprovedBy} />
        </Section>
      )}
    </div>
  );
}
