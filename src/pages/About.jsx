import React, { useEffect } from "react";
import SharedHeader from "@/components/SharedHeader";
import useThemeMode from "@/hooks/useThemeMode";

export default function About() {
  const themeMode = useThemeMode();
  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("about-surface", "dark-about");
    } else {
      document.body.classList.remove("about-surface", "dark-about");
    }
    return () => {
      document.body.classList.remove("about-surface", "dark-about");
    };
  }, [isDarkMode]);

  return (
    <div className="about-page min-h-screen bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] transition-[background,background-color] duration-500 ease-out">
      <SharedHeader variant="dashboard" />
      <main className="px-6 py-10">
        <section className="mx-auto w-full max-w-[900px] rounded-[24px] bg-white p-10 md:p-14 shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-[background,box-shadow] duration-500 ease-out dark:bg-[#0B1622] dark:shadow-[0_0_25px_rgba(0,123,127,0.3)]">
          <div className="max-w-[640px] space-y-5 text-[#1F2937] transition-colors duration-500 ease-out dark:text-[#C7D2DE]">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A0A0A] transition-colors duration-500 ease-out dark:text-white">
              About Aramatrix
            </h1>
            <p className="text-lg leading-relaxed text-[#4B5563] transition-colors duration-500 ease-out dark:text-[#C7D2DE]">
              Aramatrix helps you create AI-powered presentations instantly—keep brand consistency and build slides faster.
            </p>
            <p className="text-lg leading-relaxed text-[#4B5563] transition-colors duration-500 ease-out dark:text-[#C7D2DE]">
              Built with a clean, minimal design language and keyboard-first shortcuts.
            </p>
            <p className="text-lg leading-relaxed text-[#4B5563] transition-colors duration-500 ease-out dark:text-[#C7D2DE]">
              Roadmap: team collaboration, version history, PPTX/PDF exports, and more.
            </p>
            <p className="pt-4 text-sm text-[#6B7280] transition-colors duration-500 ease-out dark:text-[#9AA6B4]">
              © 2025 Aramatrix.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}


