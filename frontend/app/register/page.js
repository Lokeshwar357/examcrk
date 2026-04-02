"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\+?[1-9]\d{9,14}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid phone number (include country code, e.g. +91)";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = "Must include uppercase, lowercase, and a number";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validErrors = validate();
    if (Object.keys(validErrors).length) { setErrors(validErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      if (data.success) {
        toast.success("Account created! Check your email for OTP.");
        router.push(`/verify-otp?identifier=${encodeURIComponent(form.email)}&purpose=registration`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach((e) => { apiErrors[e.path] = e.msg; });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
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
            Your journey to<br /><em>exam success</em><br />starts here.
          </h1>
          <p className="auth-panel-desc">
            Join 50,000+ students who use ExamCRK to crack SSC, UPSC, CAT, NEET, JEE and more with personalised roadmaps and day-by-day study plans.
          </p>
          <div className="auth-panel-stats">
            <div>
              <div className="auth-stat-num">50K+</div>
              <div className="auth-stat-lbl">students</div>
            </div>
            <div>
              <div className="auth-stat-num">9</div>
              <div className="auth-stat-lbl">exams covered</div>
            </div>
            <div>
              <div className="auth-stat-num">94%</div>
              <div className="auth-stat-lbl">pass rate</div>
            </div>
          </div>
        </div>
        <div className="auth-panel-footer">© 2025 ExamCRK Pro. All rights reserved.</div>
      </div>

      {/* ── Right form side ── */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-sub">
            Already have an account? <Link href="/login">Sign in →</Link>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className={`form-input ${errors.name ? "error" : ""}`}
                type="text"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={set("name")}
                autoFocus
              />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className={`form-input ${errors.email ? "error" : ""}`}
                type="email"
                placeholder="arjun@email.com"
                value={form.email}
                onChange={set("email")}
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input
                className={`form-input ${errors.phone ? "error" : ""}`}
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={set("phone")}
              />
              {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className={`form-input ${errors.password ? "error" : ""}`}
                type="password"
                placeholder="Min 8 chars, uppercase + number"
                value={form.password}
                onChange={set("password")}
              />
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn-primary mt-2"
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Creating account…</> : "Create account →"}
            </button>
          </form>

          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 16, lineHeight: 1.6, fontFamily: "var(--mono)" }}>
            By registering you agree to our Terms of Service and Privacy Policy. Your password is hashed and never stored in plain text.
          </p>
        </div>
      </div>
    </div>
  );
}
