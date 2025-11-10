import React from "react";
import { Link } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";

const pageBackground = {
  background: "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)"
};

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "24px",
  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
  padding: "60px",
  margin: "40px auto",
  width: "80%"
};

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
  return (
    <div className="min-h-screen" style={pageBackground}>
      <SharedHeader variant="dashboard" />
      <main className="px-6 py-10">
        <section style={cardStyle}>
          <div className="max-w-[720px]">
            <h1 className="text-[#0A0A0A] text-3xl md:text-4xl font-extrabold tracking-tight">Features</h1>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.id}
                  className="rounded-3xl bg-white px-6 py-5 shadow-md border border-[#E5E7EB]"
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1B1533] text-white text-sm font-semibold"
                    >
                      {feature.title.charAt(0)}
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-[#111827]">{feature.title}</h2>
                      <p className="mt-1 text-sm text-[#4B5563] leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Link
              to="/create"
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-7 py-3 text-sm font-semibold text-[#1B1533] shadow-sm hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
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


