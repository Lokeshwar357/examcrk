"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState("password"); // "password" | "otp"

  // Password login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP login state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // ── Password login ────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.success) {
        login(data.user);
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
        router.push("/dashboard");
      }
    } catch (err) {
      const res = err.response?.data;
      if (res?.requires_verification) {
        toast.error("Account not verified. OTP sent to your email.");
        router.push(`/verify-otp?identifier=${encodeURIComponent(email)}&purpose=registration`);
        return;
      }
      setErrors({ form: res?.message || "Invalid email or password." });
    } finally {
      setLoading(false);
    }
  };

  // ── OTP request ───────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(otpEmail)) {
      setErrors({ otpEmail: "Enter a valid email" });
      return;
    }
    setOtpLoading(true);
    setErrors({});
    try {
      await api.post("/auth/login-otp", { email: otpEmail });
      setOtpSent(true);
      toast.success("OTP sent! Check your email.");
      router.push(`/verify-otp?identifier=${encodeURIComponent(otpEmail)}&purpose=login`);
    } catch (err) {
      setErrors({ otpEmail: err.response?.data?.message || "Failed to send OTP." });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-bg" />
        <div className="auth-panel-logo">
          <div className="auth-panel-logo-dot" />
          ExamCRK Pro
        </div>
        <div className="auth-panel-content">
          <h1 className="auth-panel-headline">
            Welcome<br />back,<br /><em>champion.</em>
          </h1>
          <p className="auth-panel-desc">
            Log in to continue your personalised study roadmap, track your daily progress, and stay ahead of your exam target.
          </p>
          <div className="auth-panel-stats">
            <div>
              <div className="auth-stat-num">120</div>
              <div className="auth-stat-lbl">day plans</div>
            </div>
            <div>
              <div className="auth-stat-num">4+</div>
              <div className="auth-stat-lbl">subjects tracked</div>
            </div>
          </div>
        </div>
        <div className="auth-panel-footer">© 2025 ExamCRK Pro. All rights reserved.</div>
      </div>

      {/* ── Right form side ── */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Sign in</h2>
          <p className="auth-form-sub">
            No account? <Link href="/register">Create one free →</Link>
          </p>

          {/* ── Tab switcher ── */}
          <div style={{
            display: "flex", background: "var(--bg3)", borderRadius: 10,
            padding: 4, marginBottom: 24, border: "1px solid var(--border)"
          }}>
            {["password", "otp"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); }}
                style={{
                  flex: 1, padding: "9px", borderRadius: 7, border: "none",
                  fontSize: 13, fontWeight: 700, transition: "all .2s",
                  background: tab === t ? "var(--card)" : "transparent",
                  color: tab === t ? "var(--text)" : "var(--text3)",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.3)" : "none",
                }}
              >
                {t === "password" ? "🔐 Password" : "📱 OTP login"}
              </button>
            ))}
          </div>

          {/* ── Password login ── */}
          {tab === "password" && (
            <form onSubmit={handlePasswordLogin} noValidate>
              {errors.form && <div className="alert alert-error">{errors.form}</div>}

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className={`form-input ${errors.email ? "error" : ""}`}
                  type="email"
                  placeholder="arjun@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); }}
                  autoFocus
                />
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className={`form-input ${errors.password ? "error" : ""}`}
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: "" })); }}
                />
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>

              <button type="submit" className="btn-primary mt-2" disabled={loading}>
                {loading ? <><span className="spinner" /> Signing in…</> : "Sign in →"}
              </button>
            </form>
          )}

          {/* ── OTP login ── */}
          {tab === "otp" && (
            <form onSubmit={handleSendOTP} noValidate>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                We'll send a one-time code to your registered email. No password needed.
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className={`form-input ${errors.otpEmail ? "error" : ""}`}
                  type="email"
                  placeholder="arjun@email.com"
                  value={otpEmail}
                  onChange={(e) => { setOtpEmail(e.target.value); setErrors({}); }}
                  autoFocus
                />
                {errors.otpEmail && <div className="form-error">⚠ {errors.otpEmail}</div>}
              </div>
              <button type="submit" className="btn-primary mt-2" disabled={otpLoading}>
                {otpLoading ? <><span className="spinner" /> Sending OTP…</> : "Send OTP →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
