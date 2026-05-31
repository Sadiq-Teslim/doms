import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function EyeIcon({ off }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
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
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#FFF8E1", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="w-full max-w-[650px] rounded-[12px] bg-white px-6 py-12 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:px-[110px] sm:py-[80px]">
        <div className="mx-auto w-full max-w-[410px]">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/bovas-logo.png" alt="BOVAS & Company" className="h-12 w-auto" />
          </div>

          {/* Heading */}
          <h1 className="mt-9 text-center text-[24px] font-bold leading-9 text-black">
            Welcome Back!
          </h1>

          <form onSubmit={submit} className="mt-9 space-y-4">
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-[14px] font-normal text-black">
                Username/Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username/work email"
                autoFocus
                required
                className="h-[56px] w-full rounded-[16px] border-[0.5px] border-[#D9D9D9] bg-[#FAF9F9] px-[23px] text-[14px] text-black outline-none transition focus:border-[#FDB706] placeholder:text-[12px] placeholder:font-light placeholder:text-black/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-[14px] font-normal text-black">Password</label>
              <div className="flex h-[56px] items-center rounded-[16px] border-[0.5px] border-[#D9D9D9] bg-[#FAF9F9] px-[23px] transition focus-within:border-[#FDB706]">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-full w-full bg-transparent text-[14px] text-black outline-none placeholder:text-[12px] placeholder:font-light placeholder:text-black/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="ml-2 shrink-0"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showPw} />
                </button>
              </div>
            </div>

            {/* Remember / forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[#A8A8A8]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-[4px] border-[0.5px] border-[#A8A8A8] accent-[#FDB706]"
                />
                Remember me
              </label>
              <button type="button" className="text-[14px] text-black hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[13px] font-medium text-[#E1251B]">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 h-[56px] w-full rounded-[16px] bg-[#FDB706] text-[14px] font-semibold text-black transition hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? "Signing In…" : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[14px] text-[#A8A8A8]">
            Don&rsquo;t have an account?{" "}
            <Link to="/signup" className="font-medium text-black hover:underline">
              Sign up!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
