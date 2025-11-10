import React from "react";
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

export default function About() {
  return (
    <div className="min-h-screen" style={pageBackground}>
      <SharedHeader variant="dashboard" />
      <main className="px-6 py-10">
        <section style={cardStyle}>
          <div className="max-w-[640px] space-y-5 text-[#1F2937]">
            <h1 className="text-[#0A0A0A] text-3xl md:text-4xl font-extrabold tracking-tight">About Aramatrix</h1>
            <p className="text-lg leading-relaxed text-[#4B5563]">
              Aramatrix helps you create AI-powered presentations instantly—keep brand consistency and build slides
              faster.
            </p>
            <p className="text-lg leading-relaxed text-[#4B5563]">
              Built with a clean, minimal design language and keyboard-first shortcuts.
            </p>
            <p className="text-lg leading-relaxed text-[#4B5563]">
              Roadmap: team collaboration, version history, PPTX/PDF exports, and more.
            </p>
            <p className="pt-4 text-sm text-[#6B7280]">© 2025 Aramatrix.</p>
          </div>
        </section>
      </main>
    </div>
  );
}


