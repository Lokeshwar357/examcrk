"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    fetchPlans();
    fetchCurrentUser();
  }, []);

  const buildPlansFromBackend = () => {
    return [
      {
        id: "monthly",
        name: "Monthly",
        amount_inr: 60,
        amount_paise: 6000,
        duration_days: 30,
      },
      {
        id: "quarterly",
        name: "3 Months",
        amount_inr: 140,
        amount_paise: 14000,
        duration_days: 90,
      },
      {
        id: "annual",
        name: "Annual",
        amount_inr: 200,
        amount_paise: 20000,
        duration_days: 365,
      },
    ];
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/payment/plans`, {
        credentials: "include",
      });

      if (!res.ok) {
        setPlans(buildPlansFromBackend());
        return;
      }

      const data = await res.json();

      if (data?.success && Array.isArray(data.plans)) {
        const correctedPlans = data.plans.map((plan) => {
          if (plan.id === "monthly") {
            return { ...plan, amount_inr: 60, amount_paise: 6000 };
          }
          if (plan.id === "quarterly") {
            return { ...plan, amount_inr: 140, amount_paise: 14000 };
          }
          if (plan.id === "annual") {
            return { ...plan, amount_inr: 200, amount_paise: 20000 };
          }
          return plan;
        });

        setPlans(correctedPlans);
      } else {
        setPlans(buildPlansFromBackend());
      }
    } catch (err) {
      console.error("PLANS ERROR:", err);
      setPlans(buildPlansFromBackend());
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setCheckingUser(true);

      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error("USER FETCH ERROR:", err);
      setUser(null);
    } finally {
      setCheckingUser(false);
    }
  };

  const hasActivePremium = () => {
    if (!user) return false;
    if (!user.premium_plan || user.premium_plan === "free") return false;
    if (!user.premium_expires_at) return false;

    return new Date(user.premium_expires_at) > new Date();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planId) => {
    try {
      setError("");

      if (checkingUser) return;

      if (!user) {
        setError("Please login first.");
        return;
      }

      if (hasActivePremium()) {
        setError("You already have an active premium plan.");
        return;
      }

      setPayingPlan(planId);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create payment order");
      }

      const selectedPlan = plans.find((p) => p.id === planId);

      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "ExamCRK Pro",
        description: `${selectedPlan?.name || planId} Plan`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#f5d547",
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                ...response,
                plan: planId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }

            await fetchCurrentUser();
            alert("Payment successful! Premium activated.");
            router.push("/dashboard");
          } catch (err) {
            console.error("VERIFY PAYMENT ERROR:", err);
            alert(err.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      setError(err.message || "Failed to create payment order");
    } finally {
      setPayingPlan("");
    }
  };

  const planMeta = {
    monthly: {
      label: "MONTHLY",
      subtitle: "Billed monthly",
      cta: "Get Monthly →",
      badge: "",
      features: [
        "All exam roadmaps unlocked",
        "Day-streak progress tracking",
        "Daily study reminders",
        "PYQ question bank access",
        "Email support",
      ],
    },
    quarterly: {
      label: "3 MONTHS",
      subtitle: "Best value plan",
      cta: "Get 3 Months →",
      badge: "MOST POPULAR",
      features: [
        "Everything in Monthly",
        "Priority email support",
        "Downloadable study schedules",
        "Performance analytics",
        "Mock test series — 50 tests",
      ],
    },
    annual: {
      label: "ANNUAL",
      subtitle: "Long term access",
      cta: "Get Annual →",
      badge: "BEST VALUE",
      features: [
        "Everything in Quarterly",
        "Lifetime roadmap updates",
        "1-on-1 strategy session",
        "Exclusive exam alert notifications",
        "Unlimited mock tests",
        "Certificate of completion",
      ],
    },
  };

  if (loading || checkingUser) {
    return (
      <div style={styles.page}>
        <div style={styles.centerText}>Loading plans...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.headingSmall}>UPGRADE</div>
        <h1 style={styles.title}>
          One plan. <span style={styles.titleAccent}>Every exam.</span>
        </h1>
        <p style={styles.subtitle}>
          Unlock all roadmaps, mock tests, and premium tools. Cancel anytime.
        </p>

        {hasActivePremium() ? (
          <div style={styles.successBox}>
            You already have an active <b>{user.premium_plan}</b> plan until{" "}
            <b>
              {new Date(user.premium_expires_at).toLocaleDateString("en-IN")}
            </b>.
          </div>
        ) : null}

        {!user && !checkingUser ? (
          <div style={styles.errorBox}>Please login first.</div>
        ) : null}

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        <div style={styles.grid}>
          {plans.map((plan) => {
            const meta = planMeta[plan.id] || {
              label: plan.name,
              subtitle: "",
              cta: "Choose Plan →",
              badge: "",
              features: [],
            };

            const currentPlanActive =
              hasActivePremium() && user?.premium_plan === plan.id;

            const isDisabled =
              payingPlan === plan.id || hasActivePremium() || currentPlanActive;

            return (
              <div
                key={plan.id}
                style={{
                  ...styles.card,
                  ...(plan.id === "quarterly" ? styles.cardHighlight : {}),
                  ...(currentPlanActive ? styles.activePlanCard : {}),
                }}
              >
                {meta.badge ? <div style={styles.badge}>{meta.badge}</div> : null}

                {currentPlanActive ? (
                  <div style={styles.activeBadge}>ACTIVE PLAN</div>
                ) : null}

                <div style={styles.planName}>{meta.label}</div>

                <div style={styles.planPrice}>
                  ₹{(plan.amount_inr ?? 0).toLocaleString("en-IN")}
                  <span style={styles.planPer}>/plan</span>
                </div>

                <div style={styles.planPeriod}>{meta.subtitle}</div>

                <ul style={styles.featureList}>
                  {meta.features.map((feature, i) => (
                    <li key={i} style={styles.featureItem}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan.id)}
                  disabled={isDisabled}
                  style={{
                    ...styles.button,
                    ...(plan.id === "quarterly"
                      ? styles.buttonPrimary
                      : styles.buttonSecondary),
                    opacity: isDisabled ? 0.65 : 1,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  {currentPlanActive
                    ? "Current Plan"
                    : hasActivePremium()
                    ? "Premium Active"
                    : payingPlan === plan.id
                    ? "Processing..."
                    : meta.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div style={styles.footerRow}>
          <span>🔒 Secure Razorpay checkout</span>
          <span>↩ Cancel anytime</span>
          <span>📧 Instant email receipt</span>
          <span>⚡ Instant access after payment</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "#f5f5f5",
    padding: "40px 20px",
  },
  wrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
  },
  headingSmall: {
    color: "#7a7a7a",
    letterSpacing: "3px",
    fontSize: "12px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "64px",
    fontWeight: 800,
    lineHeight: 1.05,
    margin: 0,
  },
  titleAccent: {
    color: "#f5d547",
  },
  subtitle: {
    marginTop: "20px",
    marginBottom: "40px",
    color: "#a0a0a0",
    fontSize: "18px",
  },
  errorBox: {
    background: "#2b0e0e",
    color: "#ffb3b3",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "24px",
    display: "inline-block",
  },
  successBox: {
    background: "#102615",
    color: "#b8f5c3",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "24px",
    display: "inline-block",
  },
  centerText: {
    color: "#fff",
    textAlign: "center",
    paddingTop: "100px",
    fontSize: "22px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "30px",
  },
  card: {
    position: "relative",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "28px",
    textAlign: "left",
  },
  cardHighlight: {
    border: "1px solid #f5d547",
    boxShadow: "0 0 0 1px rgba(245,213,71,0.2)",
  },
  activePlanCard: {
    border: "1px solid #4ade80",
    boxShadow: "0 0 0 1px rgba(74,222,128,0.2)",
  },
  badge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#f5d547",
    color: "#111",
    fontWeight: 700,
    fontSize: "12px",
    padding: "6px 14px",
    borderRadius: "999px",
  },
  activeBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#14532d",
    color: "#bbf7d0",
    fontWeight: 700,
    fontSize: "11px",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  planName: {
    color: "#bdbdbd",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "12px",
    letterSpacing: "1px",
  },
  planPrice: {
    fontSize: "54px",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "10px",
  },
  planPer: {
    fontSize: "18px",
    color: "#8f8f8f",
    marginLeft: "6px",
  },
  planPeriod: {
    color: "#8f8f8f",
    marginBottom: "28px",
    fontSize: "14px",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    marginBottom: "28px",
  },
  featureItem: {
    marginBottom: "12px",
    color: "#d7d7d7",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    borderRadius: "14px",
    padding: "16px",
    fontSize: "18px",
    fontWeight: 700,
    border: "none",
  },
  buttonPrimary: {
    background: "#f5d547",
    color: "#111",
  },
  buttonSecondary: {
    background: "transparent",
    color: "#f1f1f1",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  footerRow: {
    marginTop: "44px",
    display: "flex",
    gap: "24px",
    justifyContent: "center",
    flexWrap: "wrap",
    color: "#888",
    fontSize: "14px",
  },
};