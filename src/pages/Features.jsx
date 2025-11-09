import React from "react";
import { Link } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";

const gradientStyle = {
  background:
    "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
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
    <>
      <SharedHeader />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
        <section className="relative overflow-hidden rounded-[28px] min-h-[420px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={gradientStyle} />
          <div className="relative z-10 p-10 md:p-14">
            <div className="max-w-[720px]">
              <h1 className="text-[#0A0A0A] text-3xl md:text-4xl font-extrabold tracking-tight">Features</h1>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {features.map((feature) => (
                  <article
                    key={feature.id}
                    className="rounded-3xl bg-white/70 backdrop-blur px-6 py-5 shadow-sm border border-white/40"
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
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-white/80 px-7 py-3 text-sm font-semibold text-[#1B1533] shadow-sm hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                aria-label="Start creating a presentation"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


