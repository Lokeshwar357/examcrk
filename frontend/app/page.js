import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 62, borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,9,.95)", backdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
          ExamCRK Pro
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login">
            <button className="btn-ghost" style={{ padding: "8px 20px", fontSize: 13 }}>Sign in</button>
          </Link>
          <Link href="/register">
            <button className="btn-primary" style={{ width: "auto", padding: "9px 22px", fontSize: 13 }}>Get started →</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: 800, margin: "0 auto", padding: "7rem 2rem 4rem",
        textAlign: "center", position: "relative"
      }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(232,200,74,.1) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0
        }} />

        <div style={{
          display: "inline-block", background: "var(--amber-bg, #1e1208)",
          border: "1px solid rgba(232,160,48,.3)", borderRadius: 20,
          padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "var(--amber)",
          fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase",
          marginBottom: 24, position: "relative", zIndex: 1
        }}>
          ⚡ 50,000+ students crack exams with ExamCRK
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 800,
          lineHeight: 1.05, letterSpacing: -3, marginBottom: 20,
          position: "relative", zIndex: 1
        }}>
          Crack any exam,<br />
          <span style={{ color: "var(--accent)" }}>one day at a time.</span>
        </h1>

        <p style={{
          fontSize: 16, color: "var(--text2)", maxWidth: 480, margin: "0 auto 2.5rem",
          lineHeight: 1.8, position: "relative", zIndex: 1
        }}>
          Personalised roadmaps and day-by-day study plans for SSC, UPSC, CAT, NEET, JEE, GATE, Banking and Railway exams.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <Link href="/register">
            <button className="btn-primary" style={{ width: "auto", padding: "15px 32px", fontSize: 15 }}>
              Start free →
            </button>
          </Link>
          <Link href="/pricing">
            <button className="btn-ghost" style={{ padding: "14px 28px", fontSize: 14 }}>
              View pricing
            </button>
          </Link>
        </div>
      </div>

      {/* Exam tags */}
      <div style={{ maxWidth: 700, margin: "0 auto 5rem", padding: "0 2rem", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
          Exams covered
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {["SSC CGL", "UPSC CSE", "CAT", "NEET UG", "JEE", "GATE", "IBPS PO", "SBI PO", "SSC CHSL", "RRB NTPC"].map((e) => (
            <span key={e} style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 20, padding: "5px 14px", fontSize: 12,
              fontWeight: 600, color: "var(--text2)"
            }}>{e}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: "0 auto 6rem", padding: "0 2rem" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16
        }}>
          {[
            { icon: "🗺️", title: "Personalised roadmaps", desc: "Pick your exam + target days. Get a custom day-by-day plan built for your timeline." },
            { icon: "✅", title: "Day-strike tracking", desc: "Check off each study day. Watch your streak grow and your progress bar fill." },
            { icon: "📊", title: "Progress analytics", desc: "See exactly how far you've come — per subject, per week, overall." },
            { icon: "🔐", title: "Secure & private", desc: "JWT auth, bcrypt passwords, HTTP-only cookies. Your data stays safe." },
          ].map((f) => (
            <div key={f.title} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "1.5rem"
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid var(--border)", padding: "1.5rem 2rem",
        textAlign: "center", fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)"
      }}>
        © 2025 ExamCRK Pro · Built with Next.js + Node.js + MongoDB + Razorpay
      </div>
    </div>
  );
}
