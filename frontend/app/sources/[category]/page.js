"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

const examContent = {
  ssc: {
    title: "SSC Materials",
    description:
      "Prepare for SSC exams with subject-wise notes, practice resources, and premium study materials.",
    subjects: [
      {
        name: "Quantitative Aptitude",
        slug: "quantitative-aptitude",
        free: true,
        notes: "Percentages, ratio, profit and loss, time and work.",
      },
      {
        name: "Reasoning",
        slug: "reasoning",
        free: true,
        notes: "Analogy, series, coding-decoding, blood relations.",
      },
      {
        name: "English",
        slug: "english",
        free: true,
        notes: "Grammar, vocabulary, comprehension, error spotting.",
      },
      {
        name: "General Awareness",
        slug: "general-awareness",
        free: false,
        notes: "History, polity, geography, current affairs.",
      },
    ],
    pdfs: [
      {
        title: "SSC Quant Notes PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/ssc-quant-notes.pdf",
      },
      {
        title: "SSC Reasoning Shortcuts PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/ssc-reasoning-shortcuts.pdf",
      },
      {
        title: "SSC Advanced Mock Pack",
        premium: true,
        type: "Mock Pack",
        file: "/pdfs/ssc-advanced-mock-pack.pdf",
      },
      {
        title: "SSC Premium GA Notes",
        premium: true,
        type: "Notes",
        file: "/pdfs/ssc-premium-ga-notes.pdf",
      },
    ],
  },

  upsc: {
    title: "UPSC Materials",
    description:
      "Comprehensive UPSC study resources with GS notes, essays, optional prep, and revision materials.",
    subjects: [
      {
        name: "Polity",
        slug: "polity",
        free: true,
        notes: "Constitution, rights, parliament, judiciary.",
      },
      {
        name: "History",
        slug: "history",
        free: true,
        notes: "Ancient, medieval, modern India.",
      },
      {
        name: "Geography",
        slug: "geography",
        free: true,
        notes: "Physical, Indian, world geography.",
      },
      {
        name: "Ethics",
        slug: "ethics",
        free: false,
        notes: "Case studies, thinkers, ethical philosophy.",
      },
    ],
    pdfs: [
      {
        title: "UPSC Polity Notes PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/upsc-polity-notes.pdf",
      },
      {
        title: "UPSC History Revision PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/upsc-history-revision.pdf",
      },
      {
        title: "UPSC Ethics Case Study Pack",
        premium: true,
        type: "Case Study",
        file: "/pdfs/upsc-ethics-case-study-pack.pdf",
      },
      {
        title: "UPSC Essay Premium Bundle",
        premium: true,
        type: "Bundle",
        file: "/pdfs/upsc-essay-premium-bundle.pdf",
      },
    ],
  },

  gate: {
    title: "GATE Materials",
    description:
      "Technical preparation resources, topic notes, PYQs, and premium practice sets for GATE.",
    subjects: [
      {
        name: "Engineering Mathematics",
        slug: "engineering-mathematics",
        free: true,
        notes: "Matrices, calculus, probability, transforms.",
      },
      {
        name: "Core Subject Notes",
        slug: "core-subject-notes",
        free: true,
        notes: "Branch-specific technical concepts.",
      },
      {
        name: "PYQs",
        slug: "pyqs",
        free: false,
        notes: "Previous year solved questions with explanations.",
      },
    ],
    pdfs: [
      {
        title: "GATE Maths Notes PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/gate-maths-notes.pdf",
      },
      {
        title: "GATE Core Subject Notes",
        premium: false,
        type: "Notes",
        file: "/pdfs/gate-core-subject-notes.pdf",
      },
      {
        title: "GATE Premium PYQ Pack",
        premium: true,
        type: "PYQ Pack",
        file: "/pdfs/gate-premium-pyq-pack.pdf",
      },
    ],
  },

  cat: {
    title: "CAT Materials",
    description:
      "Topic-wise aptitude, verbal ability, LRDI sets, and premium mock resources for CAT preparation.",
    subjects: [
      {
        name: "Quant",
        slug: "quant",
        free: true,
        notes: "Arithmetic, algebra, geometry, modern maths.",
      },
      {
        name: "VARC",
        slug: "varc",
        free: true,
        notes: "Reading comprehension, para jumbles, verbal logic.",
      },
      {
        name: "LRDI",
        slug: "lrdi",
        free: false,
        notes: "Advanced puzzle sets and data interpretation practice.",
      },
    ],
    pdfs: [
      {
        title: "CAT Quant Notes",
        premium: false,
        type: "Notes",
        file: "/pdfs/cat-quant-notes.pdf",
      },
      {
        title: "CAT VARC Practice PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/cat-varc-practice.pdf",
      },
      {
        title: "CAT Premium LRDI Set",
        premium: true,
        type: "Practice Set",
        file: "/pdfs/cat-premium-lrdi-set.pdf",
      },
    ],
  },

  banking: {
    title: "Banking Materials",
    description:
      "Preparation resources for IBPS and SBI exams with aptitude, reasoning, English, and banking awareness.",
    subjects: [
      {
        name: "Arithmetic",
        slug: "arithmetic",
        free: true,
        notes: "Simplification, percentage, averages, partnership.",
      },
      {
        name: "Reasoning",
        slug: "reasoning",
        free: true,
        notes: "Puzzles, seating arrangement, syllogism.",
      },
      {
        name: "Banking Awareness",
        slug: "banking-awareness",
        free: false,
        notes: "Banking terms, RBI, current financial updates.",
      },
    ],
    pdfs: [
      {
        title: "Banking Aptitude PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/banking-aptitude.pdf",
      },
      {
        title: "Reasoning Practice Set",
        premium: false,
        type: "Practice",
        file: "/pdfs/banking-reasoning-practice-set.pdf",
      },
      {
        title: "Premium Banking Awareness Pack",
        premium: true,
        type: "Premium Pack",
        file: "/pdfs/banking-awareness-pack.pdf",
      },
    ],
  },

  neet: {
    title: "NEET Materials",
    description:
      "Biology, Physics, Chemistry notes, revision sheets, and premium question banks for NEET.",
    subjects: [
      {
        name: "Biology",
        slug: "biology",
        free: true,
        notes: "NCERT-based chapter summaries and diagrams.",
      },
      {
        name: "Physics",
        slug: "physics",
        free: true,
        notes: "Formulas, concepts, and numerical practice.",
      },
      {
        name: "Chemistry",
        slug: "chemistry",
        free: false,
        notes: "Organic mechanisms, inorganic revision, mock tests.",
      },
    ],
    pdfs: [
      {
        title: "NEET Biology Notes",
        premium: false,
        type: "Notes",
        file: "/pdfs/neet-biology-notes.pdf",
      },
      {
        title: "NEET Physics Formula Sheet",
        premium: false,
        type: "Formula Sheet",
        file: "/pdfs/neet-physics-formula-sheet.pdf",
      },
      {
        title: "Premium Chemistry Question Bank",
        premium: true,
        type: "Question Bank",
        file: "/pdfs/neet-chemistry-question-bank.pdf",
      },
    ],
  },

  jee: {
    title: "JEE Materials",
    description:
      "JEE preparation resources with Physics, Chemistry, Maths notes, PYQs, and premium test packs.",
    subjects: [
      {
        name: "Mathematics",
        slug: "mathematics",
        free: true,
        notes: "Algebra, calculus, coordinate geometry.",
      },
      {
        name: "Physics",
        slug: "physics",
        free: true,
        notes: "Mechanics, electricity, modern physics.",
      },
      {
        name: "Chemistry",
        slug: "chemistry",
        free: false,
        notes: "Physical, organic, inorganic premium content.",
      },
    ],
    pdfs: [
      {
        title: "JEE Maths Notes",
        premium: false,
        type: "Notes",
        file: "/pdfs/jee-maths-notes.pdf",
      },
      {
        title: "JEE Physics Revision PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/jee-physics-revision.pdf",
      },
      {
        title: "Premium Chemistry Test Pack",
        premium: true,
        type: "Test Pack",
        file: "/pdfs/jee-chemistry-test-pack.pdf",
      },
    ],
  },

  rrb: {
    title: "RRB Materials",
    description:
      "Railway exam preparation notes, reasoning, arithmetic, and premium practice sets.",
    subjects: [
      {
        name: "Arithmetic",
        slug: "arithmetic",
        free: true,
        notes: "Basic maths, percentages, ratio, averages.",
      },
      {
        name: "Reasoning",
        slug: "reasoning",
        free: true,
        notes: "Series, analogy, coding-decoding, puzzle basics.",
      },
      {
        name: "General Awareness",
        slug: "general-awareness",
        free: false,
        notes: "Railways, current affairs, static GK.",
      },
    ],
    pdfs: [
      {
        title: "RRB Maths Notes",
        premium: false,
        type: "Notes",
        file: "/pdfs/rrb-maths-notes.pdf",
      },
      {
        title: "RRB Reasoning PDF",
        premium: false,
        type: "PDF",
        file: "/pdfs/rrb-reasoning.pdf",
      },
      {
        title: "Premium GK Booster",
        premium: true,
        type: "Booster",
        file: "/pdfs/rrb-gk-booster.pdf",
      },
    ],
  },
};

export default function Page({ params }) {
  const router = useRouter();
  const category = params.category;

  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isPremium = !!user?.is_premium || user?.plan !== "free";

  const content = examContent[category] || {
    title: `${category.toUpperCase()} Materials`,
    description: "Study materials will be added here.",
    subjects: [],
    pdfs: [],
  };

  const handleOpenResource = (resource) => {
    if (resource.premium && !isPremium) {
      router.push("/pricing");
      return;
    }

    if (resource.file) {
      window.open(resource.file, "_blank");
      return;
    }

    if (resource.link) {
      window.open(resource.link, "_blank");
    }
  };

  const handleOpenSubject = (subject) => {
    if (!subject.free && !isPremium) {
      router.push("/pricing");
      return;
    }

    router.push(`/sources/${category}/${subject.slug}`);
  };

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "white",
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "inline-block",
            marginBottom: "12px",
            padding: "6px 12px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "999px",
            fontSize: "12px",
            color: "#d4d4d8",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {category.toUpperCase()} Exam Hub
        </div>

        <h1 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "10px" }}>
          {content.title}
        </h1>

        <p style={{ color: "#a1a1aa", maxWidth: "760px", lineHeight: 1.6 }}>
          {content.description}
        </p>
      </div>

      {!isPremium && (
        <div
          style={{
            marginBottom: "28px",
            padding: "18px 20px",
            borderRadius: "18px",
            border: "1px solid rgba(232,200,74,.25)",
            background: "rgba(232,200,74,.06)",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: 6 }}>
              Unlock premium resources
            </div>
            <div style={{ color: "#b3b3b8", fontSize: "14px" }}>
              Access advanced notes, mock packs, premium PDFs, and locked subjects.
            </div>
          </div>

          <button
            onClick={() => router.push("/pricing")}
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            View plans
          </button>
        </div>
      )}

      <div style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Subjects</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {content.subjects.map((subject, index) => {
            const locked = !subject.free && !isPremium;

            return (
              <div
                key={index}
                onClick={() => handleOpenSubject(subject)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform .2s ease, border-color .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                    {subject.name}
                  </h3>
                  <span style={{ fontSize: "16px" }}>{locked ? "🔒" : "📘"}</span>
                </div>

                <p style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: 1.6, marginBottom: "14px" }}>
                  {locked ? "Upgrade to premium to access this subject." : subject.notes}
                </p>

                <div style={{ fontSize: "13px", color: locked ? "#f4d35e" : "#cfcfd3" }}>
                  {locked ? "Premium only" : "Open subject →"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Study Resources</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {content.pdfs.map((resource, index) => {
            const locked = resource.premium && !isPremium;

            return (
              <div
                key={index}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>
                      {resource.title}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#a1a1aa" }}>
                      {resource.type}
                    </div>
                  </div>

                  <span style={{ fontSize: "18px" }}>{locked ? "🔒" : "📄"}</span>
                </div>

                <button
                  onClick={() => handleOpenResource(resource)}
                  style={{
                    marginTop: "8px",
                    padding: "11px 16px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {locked ? "Upgrade to access" : "Open Resource"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}