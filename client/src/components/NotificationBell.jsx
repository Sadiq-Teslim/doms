import { useEffect, useRef, useState } from "react";
import api from "../api.js";
import { IconBell } from "./Icons.jsx";

export default function NotificationBell() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  async function load() {
    try {
      const res = await api.get("/notifications");
      setNotes(res.data);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = notes.filter((n) => !n.read).length;

  async function markAll() {
    await api.post("/notifications/read-all");
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white text-ink-500 transition hover:border-ink/25 hover:text-ink"
        title="Notifications"
      >
        <IconBell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white ring-2 ring-cream-100">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 max-h-[26rem] w-80 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-ink/[0.07] px-4 py-3">
            <span className="font-display text-sm font-bold">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-brand hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[22rem] overflow-y-auto">
            {notes.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-ink-400">You're all caught up.</p>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 border-b border-ink/[0.05] px-4 py-3 text-sm last:border-0 ${
                    n.read ? "" : "bg-brand-50/60"
                  }`}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  <div className={n.read ? "pl-5" : ""}>
                    <p className={n.read ? "text-ink-400" : "text-ink"}>{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
