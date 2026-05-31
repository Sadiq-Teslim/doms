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
      /* ignore transient errors */
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
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#2D2922] transition hover:bg-black/5"
        title="Notifications"
      >
        <IconBell size={22} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-2 h-2.5 w-2.5 rounded-full bg-[#FF0000] ring-2 ring-[#FAF9F7]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-3 w-80 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
            <span className="text-[14px] font-semibold text-[#2D2922]">
              Notifications{unread > 0 && <span className="ml-1.5 text-[#A57506]">({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[12px] font-medium text-[#A57506] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[22rem] overflow-y-auto">
            {notes.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-[#A39E96]">You're all caught up.</p>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 border-b border-black/[0.04] px-4 py-3 text-[13px] last:border-0 ${
                    n.read ? "" : "bg-[#FFF8E2]"
                  }`}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FDB706]" />}
                  <div className={n.read ? "pl-4" : ""}>
                    <p className={n.read ? "text-[#6B665E]" : "text-[#2D2922]"}>{n.message}</p>
                    <p className="mt-1 text-[11px] text-[#A39E96]">{new Date(n.createdAt).toLocaleString()}</p>
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
