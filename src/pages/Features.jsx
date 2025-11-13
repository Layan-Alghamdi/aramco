import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";
import useThemeMode from "@/hooks/useThemeMode";

const features = [
  {
    id: "smart-editing",
    title: "Smart Editing",
    description: "Text boxes, shapes, images, lines & arrows."
  },
  {
    id: "slide-templates",
    title: "Slide Templates",
    description: "Title, Title+Content, Two-Column, Image Focus, Blank."
  },
  {
    id: "themes-colors",
    title: "Themes & Colors",
    description: "Brand palette + custom swatches."
  },
  {
    id: "tables",
    title: "Tables",
    description: "Rows/cols, cell formatting (coming soon: merge)."
  },
  {
    id: "export",
    title: "Export",
    description: "Current slide as PNG (PPTX/PDF coming soon)."
  },
  {
    id: "collaboration",
    title: "Collaboration",
    description: "Real-time editing (roadmap)."
  }
];

export default function Features() {
  const themeMode = useThemeMode();

  useEffect(() => {
    document.body.classList.add("features-surface");
    return () => {
      document.body.classList.remove("features-surface");
      document.body.classList.remove("dark-features");
    };
  }, []);

  useEffect(() => {
    if (themeMode === "dark") {
      document.body.classList.add("dark-features");
    } else {
      document.body.classList.remove("dark-features");
    }
  }, [themeMode]);

  return (
    <div className="features-shell min-h-screen bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] transition-colors duration-200 ease-out dark:bg-[linear-gradient(180deg,#0f1b2d_0%,#0b1426_100%)]">
      <SharedHeader variant="dashboard" />
      <main className="features-content px-6 py-10">
        <section className="features-panel mx-auto my-10 w-[80%] rounded-[24px] border border-white/70 bg-white/95 p-14 shadow-[0_6px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out dark:border-[#243244] dark:bg-[#0f172a]/95 dark:shadow-[0_20px_60px_rgba(3,12,29,0.45)]">
          <div className="features-copy max-w-[720px]">
            <h1 className="features-title text-3xl font-extrabold tracking-tight text-[#0A0A0A] md:text-4xl transition-colors duration-200 ease-out dark:text-[#e6edf3]">
              Features
            </h1>
            <div className="features-grid mt-8 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.id}
                  className="features-card rounded-3xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-md transition-colors duration-200 ease-out"
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="features-card-badge mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1B1533] text-sm font-semibold text-white"
                    >
                      {feature.title.charAt(0)}
                    </span>
                    <div>
                      <h2 className="features-card-title text-lg font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                        {feature.title}
                      </h2>
                      <p className="features-card-description mt-1 text-sm leading-relaxed text-[#4B5563] transition-colors duration-200 ease-out dark:text-[#b6c2cf]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Link
              to="/create"
              className="features-cta mt-10 inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-7 py-3 text-sm font-semibold text-[#1B1533] shadow-sm transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-transparent dark:text-white"
              aria-label="Start creating a presentation"
            >
              Start Creating
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}


