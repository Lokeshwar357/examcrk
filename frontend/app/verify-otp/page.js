"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

function OTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  const identifier = params.get("identifier") || "";
  const purpose = params.get("purpose") || "registration";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // ── Countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Focus first box on mount ──────────────────────────────
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Handle digit input ────────────────────────────────────
  const handleChange = (idx, val) => {
    const char = val.replace(/\D/g, "").slice(-1); // digits only
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    setError("");

    if (char && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (char && idx === 5) {
      const code = [...next].join("");
      if (code.length === 6) submitOTP(code);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  // Handle paste of full OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      submitOTP(pasted);
    }
  };

  // ── Submit OTP to backend ─────────────────────────────────
  const submitOTP = async (code) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/verify-otp", {
        identifier,
        otp: code,
        purpose,
      });
      if (data.success) {
        login(data.user);
        toast.success(data.message);
        router.push("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed.";
      setError(msg);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    submitOTP(code);
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await api.post("/auth/resend-otp", { identifier, purpose });
      toast.success("New OTP sent!");
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend.");
    } finally {
      setResendLoading(false);
    }
  };

  const masked = identifier.includes("@")
    ? identifier.replace(/(.{2}).+(@.+)/, "$1****$2")
    : identifier.replace(/(.{2}).+(.{2})/, "$1*****$2");

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem",
      background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,200,74,.05) 0%, transparent 60%)"
    }}>
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <div className="auth-panel-logo-dot" />
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>ExamCRK Pro</span>
        </Link>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(232,200,74,.1)", border: "1px solid rgba(232,200,74,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, margin: "0 auto 24px"
        }}>
          📬
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.75px", marginBottom: 10 }}>
          Check your {identifier.includes("@") ? "email" : "phone"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 32 }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: "var(--text)" }}>{masked}</strong>
        </p>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ textAlign: "left", marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        {/* OTP boxes */}
        <form onSubmit={handleManualSubmit}>
          <div className="otp-row" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className={`otp-box ${d ? "filled" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || digits.join("").length !== 6}
            style={{ marginTop: 8 }}
          >
            {loading ? <><span className="spinner" /> Verifying…</> : "Verify →"}
          </button>
        </form>

        {/* Resend */}
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--text3)" }}>
          {countdown > 0 ? (
            <span>Resend OTP in <strong style={{ color: "var(--accent)", fontFamily: "var(--mono)" }}>{countdown}s</strong></span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              {resendLoading ? "Sending…" : "Resend OTP"}
            </button>
          )}
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
          Wrong address?{" "}
          <Link href="/register" style={{ color: "var(--accent)", fontWeight: 700 }}>
            Go back
          </Link>
        </div>

        {/* Security note */}
        <div style={{
          marginTop: 32, padding: "12px 16px",
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: 10, fontSize: 12, color: "var(--text3)",
          fontFamily: "var(--mono)", lineHeight: 1.6, textAlign: "left"
        }}>
          🔒 Never share your OTP with anyone. ExamCRK will never call or message asking for it.
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
      <OTPForm />
    </Suspense>
  );
}
