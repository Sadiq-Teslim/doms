import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { IconArrowRight } from "../components/Icons.jsx";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-forest p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <Logo size={44} rounded={18} />
          <span className="font-display text-xl font-bold">DOMS</span>
        </div>

        <div className="relative">
          <h1 className="font-display text-5xl font-bold leading-[1.05]">
            Move every load
            <br />
            with <span className="text-gold">confidence.</span>
          </h1>
          <p className="mt-5 max-w-md text-white/70">
            One connected workflow for logistics, safety, dispatch, overload control and gate
            clearance — from loading ticket to truck exit.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {["Logistics", "Safety", "Dispatch", "Overload", "Gate"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/40">
          Depot Operations Management System
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-cream px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size={40} />
            <span className="font-display text-lg font-bold text-forest">DOMS</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-ink">Welcome back</h2>
          <p className="mt-2 text-sm text-ink-400">Sign in to your operations console.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="rounded-xl bg-coral-100 px-3.5 py-2.5 text-sm font-medium text-coral-600">
                {error}
              </p>
            )}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <IconArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-ink-400">
            Access is managed by your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
