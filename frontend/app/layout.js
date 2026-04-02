import { Syne, DM_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";
import "../styles/globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "ExamCRK Pro — Crack Any Exam",
  description: "Personalised roadmaps, daily study plans & premium tools for competitive exam prep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a18",
                color: "#f0ede4",
                border: "1px solid #272724",
                fontFamily: "var(--font-syne)",
                fontSize: "13px",
              },
              success: { iconTheme: { primary: "#4caf7d", secondary: "#0a1f14" } },
              error: { iconTheme: { primary: "#e05a4e", secondary: "#1e0806" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
