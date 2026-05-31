import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const DEPARTMENTS = ["Dispatch", "Logistics", "Safety", "Admin", "Security"];

const INPUT =
  "h-[56px] w-full rounded-[16px] border-[0.5px] border-[#E6E1D9] bg-[#FAF9F7] px-[23px] text-[14px] text-[#2D2922] outline-none transition focus:border-[#FDB706] placeholder:text-[12px] placeholder:font-light placeholder:text-black/20";
const LABEL = "block text-[14px] font-normal text-[#4C4841]";

function EyeIcon({ off }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

export default function SignUp() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", department: "", username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.department) return setError("Please select a department.");
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not create account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Illustration — fixed half width, fills the panel, anchored to the top
          (only the empty bottom trims on wide screens), never scrolls */}
      <div className="hidden h-screen lg:block lg:w-1/2">
        <img src="/bovas-signup.png" alt="BOVAS — Store, Dispatch, Deliver" className="h-screen w-full object-cover object-top" />
      </div>

      {/* Form panel — the only scrollable area */}
      <div className="h-screen w-full overflow-y-auto px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-[620px]">
          <h1 className="text-[24px] font-bold leading-9 text-[#2D2922]">Create Account</h1>

          <form onSubmit={submit} className="mt-10 space-y-6">
            {/* Full name */}
            <div className="space-y-3">
              <label className={LABEL}>Full Name</label>
              <input className={INPUT} value={form.fullName} onChange={set("fullName")} placeholder="Enter your full name" required />
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className={LABEL}>Email Address</label>
              <input className={INPUT} type="email" value={form.email} onChange={set("email")} placeholder="Enter your work email address" required />
            </div>

            {/* Department (custom dropdown) */}
            <div className="space-y-3">
              <label className={LABEL}>Department</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDeptOpen((v) => !v)}
                  className="flex h-[56px] w-full items-center justify-between rounded-[16px] border-[0.5px] border-[#E6E1D9] bg-[#FAF9F7] px-[23px] text-left outline-none transition focus:border-[#FDB706]"
                >
                  <span className={`text-[14px] ${form.department ? "text-[#2D2922]" : "text-[12px] font-light text-[#2D2922]"}`}>
                    {form.department || "Select"}
                  </span>
                  <svg width="14" height="9" viewBox="0 0 14 9" fill="none" className={`shrink-0 transition-transform ${deptOpen ? "rotate-180" : ""}`}>
                    <path d="M1 1l6 6 6-6" stroke="#2D2922" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {deptOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDeptOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[160px] rounded-[16px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                      <div className="flex flex-col gap-5">
                        {DEPARTMENTS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, department: d }));
                              setDeptOpen(false);
                            }}
                            className="text-left text-[14px] text-black transition hover:text-[#E1251B]"
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-3">
              <label className={LABEL}>Username</label>
              <input className={INPUT} value={form.username} onChange={set("username")} placeholder="Enter your username" required />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className={LABEL}>Password</label>
              <div className="flex h-[56px] items-center rounded-[16px] border-[0.5px] border-[#E6E1D9] bg-[#FAF9F7] px-[23px] transition focus-within:border-[#FDB706]">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Enter your password"
                  required
                  className="h-full w-full bg-transparent text-[14px] text-[#2D2922] outline-none placeholder:text-[12px] placeholder:font-light placeholder:text-black/20"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="ml-2 shrink-0" aria-label={showPw ? "Hide password" : "Show password"}>
                  <EyeIcon off={showPw} />
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[13px] font-medium text-[#E1251B]">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="h-[56px] w-full rounded-[16px] border-[0.5px] border-[#D8C0C0] bg-[#FDB706] text-[14px] font-semibold text-[#2D2922] transition hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Sign Up"}
            </button>

            <p className="text-center text-[14px] text-[#A8A8A8]">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[#2D2922] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
