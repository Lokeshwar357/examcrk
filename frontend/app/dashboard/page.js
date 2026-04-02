"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  // ── Guard: redirect if not logged in ─────────────────────
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // ── Fetch dashboard data ──────────────────────────────────
  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get("/user/dashboard"),
      api.get("/payment/history"),
    ]).then(([dashRes, payRes]) => {
      setDashData(dashRes.data.dashboard);
      setPayments(payRes.data.payments || []);
    }).catch(() => {
      toast.error("Failed to load dashboard.");
    }).finally(() => setDashLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" style={{ width: 36, height: 36, borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  const stats = dashData?.stats;
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const EXAM_CARDS = [
    { id: "ssc_cgl",  name: "SSC CGL",      icon: "📋", color: "var(--accent)", bg: "rgba(232,200,74,.1)" },
    { id: "upsc",     name: "UPSC CSE",     icon: "🏛️", color: "var(--blue)",   bg: "rgba(91,156,246,.1)" },
    { id: "cat",      name: "CAT",           icon: "📊", color: "var(--amber)",  bg: "rgba(232,160,48,.1)" },
    { id: "gate",     name: "GATE",          icon: "⚙️", color: "var(--cyan, #3dd6c8)",  bg: "rgba(61,214,200,.1)" },
    { id: "banking",  name: "IBPS / SBI PO", icon: "🏦", color: "var(--green)",  bg: "rgba(76,175,125,.1)" },
    { id: "neet",     name: "NEET UG",       icon: "🩺", color: "var(--red)",    bg: "rgba(224,90,78,.1)" },
    { id: "jee",      name: "JEE",           icon: "🔬", color: "var(--purple, #b57cf6)", bg: "rgba(181,124,246,.1)" },
    { id: "ssc_chsl", name: "SSC CHSL",      icon: "📝", color: "var(--accent)", bg: "rgba(232,200,74,.1)" },
    { id: "rrb",      name: "RRB NTPC",      icon: "🚆", color: "var(--amber)",  bg: "rgba(232,160,48,.1)" },
  ];

  return (
    <>
      {/* ── Nav ── */}
      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <div className="dash-nav-logo">
            <div className="auth-panel-logo-dot" />
            ExamCRK Pro
          </div>
          <div className="dash-nav-right">
            {user.is_premium && (
              <div className="premium-badge">⭐ Premium</div>
            )}
            <div className="dash-user-pill">
              <div className="dash-avatar">{initials}</div>
              <span>{user.name.split(" ")[0]}</span>
            </div>
            <button
              onClick={logout}
              className="btn-ghost"
              style={{ padding: "8px 14px", fontSize: 12 }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="dash-page">
        {/* Hero */}
        <div className="dash-hero">
          <div className="dash-greeting">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}
          </div>
          <h1 className="dash-title">
            Welcome back,<br /><span>{user.name.split(" ")[0]}.</span>
          </h1>
        </div>

        {/* Stats row */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Account status</div>
            <div className="stat-value" style={{ fontSize: 20, color: user.is_premium ? "var(--green)" : "var(--text2)" }}>
              {user.is_premium ? "Premium ⭐" : "Free"}
            </div>
            <div className="stat-sub">{user.is_premium ? `${user.premium_plan} plan` : "Upgrade for full access"}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Days until expiry</div>
            <div className="stat-value">
              {stats?.days_until_expiry ?? "—"}
            </div>
            <div className="stat-sub">
              {stats?.premium_expires_at
                ? `Expires ${new Date(stats.premium_expires_at).toLocaleDateString("en-IN")}`
                : "No active plan"}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total payments</div>
            <div className="stat-value">{stats?.total_payments ?? 0}</div>
            <div className="stat-sub">successful transactions</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Member since</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </div>
            <div className="stat-sub">account verified ✓</div>
          </div>
        </div>

        {/* Premium upgrade CTA */}
        {!user.is_premium && (
          <div className="premium-cta">
            <div className="premium-cta-text">
              <h3>Unlock <span>full access</span> to all exams</h3>
              <p>Get complete roadmaps, mock tests, progress analytics and more. Starting at ₹199/month.</p>
            </div>
            <Link href="/pricing">
              <button className="btn-primary" style={{ width: "auto", padding: "13px 28px", whiteSpace: "nowrap" }}>
                View plans →
              </button>
            </Link>
          </div>
        )}

        {/* Exam roadmaps grid */}
        <div className="section-title" style={{ marginBottom: 14 }}>Your exam roadmaps</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12, marginBottom: "2.5rem"
        }}>
          {EXAM_CARDS.map((exam) => {
            // Free users can view roadmaps — premium unlocks mock tests & analytics
            const locked = false;
            return (
              <div
                key={exam.id}
                onClick={() => {
                  router.push(`/examcrk?exam=${exam.id}`);
                }}
                style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: "1.25rem",
                  cursor: "pointer", transition: "all .2s", position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "var(--border2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: exam.bg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 20, marginBottom: 12
                }}>{exam.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{exam.name}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                  Click to start →
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment history */}
        {payments.length > 0 && (
          <>
            <div className="section-title">Payment history</div>
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2rem"
            }}>
              {payments.map((p, i) => (
                <div key={p._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "1rem 1.5rem",
                  borderBottom: i < payments.length - 1 ? "1px solid var(--border)" : "none",
                  gap: "1rem", flexWrap: "wrap"
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                      {p.plan_name.charAt(0).toUpperCase() + p.plan_name.slice(1)} Plan
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                      {new Date(p.created_at).toLocaleDateString("en-IN")} · {p.order_id.slice(0, 18)}…
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)" }}>
                      ₹{(p.amount / 100).toLocaleString("en-IN")}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      fontFamily: "var(--mono)",
                      background: p.status === "paid" ? "var(--green-bg)" : "var(--red-bg)",
                      color: p.status === "paid" ? "var(--green)" : "var(--red)",
                      border: `1px solid ${p.status === "paid" ? "rgba(76,175,125,.3)" : "rgba(224,90,78,.3)"}`,
                    }}>
                      {p.status === "paid" ? "✓ Paid" : p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Account card */}
        <div className="section-title">Account details</div>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "1.5rem",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem"
        }}>
          {[
            ["Name", user.name],
            ["Email", user.email],
            ["Phone", user.phone],
            ["Verified", user.is_verified ? "✓ Verified" : "⚠ Not verified"],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{lbl}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: lbl === "Verified" && user.is_verified ? "var(--green)" : "var(--text)" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
