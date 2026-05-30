import { STATUS_LABELS, STATUS_STYLES } from "../constants.js";

export default function StatusBadge({ status }) {
  return (
    <span className={`chip ${STATUS_STYLES[status] || "bg-ink/5 text-ink-500"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
