import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";

const LIGHT_BACKGROUND = "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)";
const DARK_BACKGROUND = "radial-gradient(circle at 30% 30%, #0A1A2F 0%, #003B2E 100%)";
const STORAGE_KEY = "homeDarkMode";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  const backgroundStyle = useMemo(
    () => ({
      background: isDarkMode ? DARK_BACKGROUND : LIGHT_BACKGROUND,
      transition: "background 0.3s ease"
    }),
    [isDarkMode]
  );

  const headingClasses = `font-extrabold tracking-tight leading-tight space-y-2 transition-colors duration-300 ${
    isDarkMode ? "text-white" : "text-black"
  }`;

  const paragraphClasses = `mt-6 max-w-[560px] text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
    isDarkMode ? "text-[#D0D6E0]" : "text-gray-500"
  }`;

  const heroCardClasses = `relative w-full max-w-[1200px] rounded-[24px] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.12),0_0_30px_rgba(0,150,255,0.18)] transition-colors duration-300 ${
    isDarkMode ? "bg-[#0F1C2A]/95" : "bg-white"
  }`;

  const ctaButtonClasses = `group inline-flex items-center gap-4 rounded-full pl-8 pr-3 py-4 transition-all duration-300 shadow-sm ${
    isDarkMode
      ? "bg-white text-[#0A0A0A] border border-transparent hover:shadow-lg"
      : "border border-[#C9CED6] bg-white/70 backdrop-blur text-[#0A0A0A] hover:shadow-md"
  }`;

  const toggleButtonClasses = `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 shadow-sm ${
    isDarkMode ? "bg-white text-[#0A0A0A] border border-transparent" : "bg-[#1B1533] text-white"
  }`;

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <SharedHeader variant="dashboard" />
      <main className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10">
        <section className={heroCardClasses}>
          <div className="absolute top-6 right-6 z-20">
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={toggleButtonClasses}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          <div className="relative grid lg:grid-cols-2 items-center transition-colors duration-300">
            <div className="p-10 md:p-14">
              <h1 className={headingClasses}>
                <span className="block text-[2.75rem] sm:text-6xl lg:text-7xl">Aramatrix</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl">Create AI-Powered Presentations Instantly</span>
              </h1>
              <p className={paragraphClasses}>
                Design smart slides, maintain brand consistency, and collaborate in real-time — no design skills required.
              </p>

              <Link to="/login" className={`${ctaButtonClasses} mt-8`}>
                <span>Start Now</span>
                <span
                  className={`grid place-items-center w-12 h-12 rounded-full transition-colors duration-300 ${
                    isDarkMode ? "bg-[#1B1533] text-white" : "bg-[#1B1533] text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 transition-transform duration-300 -rotate-45 group-hover:rotate-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="p-10 md:p-14">
              <div
                className={`w-full min-h-[360px] md:min-h-[420px] rounded-[28px] transition-colors duration-300 ${
                  isDarkMode ? "bg-[#17263C]" : "bg-white"
                }`}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


