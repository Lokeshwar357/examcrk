"use client";

const subjectData = {
  ssc: {
    "quantitative-aptitude": {
      title: "Quantitative Aptitude",
      description: "Master SSC maths topics with shortcuts, formulas, and practice.",
      topics: [
        "Percentages",
        "Ratio & Proportion",
        "Profit & Loss",
        "Time & Work",
        "Simple & Compound Interest",
      ],
    },
    reasoning: {
      title: "Reasoning",
      description: "Build logic and problem-solving speed for SSC reasoning.",
      topics: [
        "Analogy",
        "Series",
        "Coding-Decoding",
        "Blood Relations",
        "Puzzles",
      ],
    },
    english: {
      title: "English",
      description: "Improve grammar, vocabulary, and comprehension for SSC.",
      topics: [
        "Grammar",
        "Vocabulary",
        "Comprehension",
        "Error Spotting",
      ],
    },
    "general-awareness": {
      title: "General Awareness",
      description: "Static GK and current affairs for SSC exams.",
      topics: [
        "History",
        "Polity",
        "Geography",
        "Current Affairs",
      ],
    },
  },

  upsc: {
    polity: {
      title: "Polity",
      description: "UPSC polity notes and important constitutional topics.",
      topics: ["Constitution", "Fundamental Rights", "Parliament", "Judiciary"],
    },
    history: {
      title: "History",
      description: "UPSC history coverage from ancient to modern India.",
      topics: ["Ancient", "Medieval", "Modern", "Freedom Movement"],
    },
    geography: {
      title: "Geography",
      description: "Physical, Indian, and world geography for UPSC.",
      topics: ["Geomorphology", "Climate", "India", "World Geography"],
    },
    ethics: {
      title: "Ethics",
      description: "Ethics theory and case-study practice for UPSC Mains.",
      topics: ["Ethics Basics", "Thinkers", "Aptitude", "Case Studies"],
    },
  },
};

export default function SubjectPage({ params }) {
  const { category, subject } = params;
  const data = subjectData[category]?.[subject];

  if (!data) {
    return (
      <div style={{ padding: "30px", color: "white" }}>
        <h1>Subject not found</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto", color: "white" }}>
      <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "10px" }}>
        {data.title}
      </h1>

      <p style={{ color: "#a1a1aa", marginBottom: "24px", lineHeight: 1.6 }}>
        {data.description}
      </p>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          padding: "22px",
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "14px" }}>Topics</h2>

        <ul style={{ paddingLeft: "18px", margin: 0 }}>
          {data.topics.map((topic, index) => (
            <li key={index} style={{ marginBottom: "10px", color: "#d4d4d8" }}>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}