import React from "react";
import SharedHeader from "@/components/SharedHeader";

const gradientStyle = {
  background:
    "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
};

export default function About() {
  return (
    <>
      <SharedHeader />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
        <section className="relative overflow-hidden rounded-[28px] min-h-[420px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={gradientStyle} />
          <div className="relative z-10 p-10 md:p-14">
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
          </div>
        </section>
      </main>
    </>
  );
}


