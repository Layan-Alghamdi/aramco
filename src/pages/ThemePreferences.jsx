import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyTheme, loadThemePreference, setThemePreference } from "@/lib/theme";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const THEMES = [
  {
    id: "light",
    title: "Light",
    description: "Bright panels, crisp typography, and uplifted cards.",
    preview: "linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)"
  },
  {
    id: "dark",
    title: "Dark",
    description: "Deep navy canvas with luminous accent elements.",
    preview: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
  },
  {
    id: "system",
    title: "System",
    description: "Match the appearance of your device automatically.",
    preview: "linear-gradient(135deg, #FFFFFF 0%, #111827 100%)"
  }
];

export default function ThemePreferences() {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [initialPreference, setInitialPreference] = useState("system");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const theme = loadThemePreference();
    setSelectedTheme(theme);
    setInitialPreference(theme);
    applyTheme(theme);
  }, []);

  const handleSelect = (themeId) => {
    setSelectedTheme(themeId);
    setStatus("");
    applyTheme(themeId);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setThemePreference(selectedTheme);
    setInitialPreference(selectedTheme);
    setStatus("Theme preference saved.");
  };

  const handleCancel = () => {
    applyTheme(initialPreference);
    setSelectedTheme(initialPreference);
    navigate("/profile");
  };

  return (
    <section
      className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-['Poppins',ui-sans-serif] text-[#1E1E1E] transition-colors duration-500 ease-gentle-spring dark:bg-[#0b1628] dark:text-text-inverted"
    >
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div className="absolute inset-0 bg-white transition-colors duration-500 ease-gentle-spring dark:bg-surface-dark" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-12">
          <header className="flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-[#F3F4F6] dark:border-white/20 dark:bg-surface-dark dark:text-text-inverted dark:hover:bg-surface-dark/80"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <form
              onSubmit={handleSave}
              className="w-full max-w-[700px] space-y-10 rounded-[28px] border border-[#E5E7EB] bg-white/90 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)] transition-all duration-500 ease-gentle-spring dark:border-white/15 dark:bg-surface-dark/90 dark:shadow-soft-xl-dark"
            >
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-semibold text-[#0A0A0A] transition-colors duration-500 dark:text-text-inverted">Theme Preferences</h1>
                <p className="text-sm text-[#6B7280] transition-colors duration-500 dark:text-text-muted">
                  Switch between light, dark, or follow your system appearance.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {THEMES.map((theme) => {
                  const isActive = selectedTheme === theme.id;
                  return (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => handleSelect(theme.id)}
                      className={`group relative flex flex-col items-start gap-4 rounded-[24px] border px-5 py-6 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50 dark:focus-visible:ring-brandBlue-500 ${
                        isActive
                          ? "border-[#2563EB] bg-[#EBF2FF] dark:border-brandBlue-500 dark:bg-brandBlue-500/10"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5F5] dark:border-white/15 dark:bg-surface-dark dark:hover:border-brandBlue-500/40"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#CBD5F5] bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] transition-colors duration-500 dark:border-brandBlue-500/30 dark:bg-surface-dark/70 dark:text-text-inverted">
                        {isActive ? "Selected" : "Preview"}
                      </span>
                      <div
                        className="h-28 w-full rounded-2xl shadow-inner"
                        style={{ background: theme.preview }}
                        aria-hidden="true"
                      />
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-[#111827] transition-colors duration-500 dark:text-text-inverted">
                          {theme.title}
                        </h2>
                        <p className="text-sm text-[#6B7280] leading-relaxed transition-colors duration-500 dark:text-text-muted">
                          {theme.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {status && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 text-center">
                  {status}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-[#D1D5DB] bg-white px-6 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-[#F3F4F6] dark:border-white/20 dark:bg-transparent dark:text-text-inverted dark:hover:bg-surface-dark/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-brandEmerald-500 to-brandBlue-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(27,21,51,0.25)] transition hover:opacity-90 dark:shadow-brandBlue-700/40"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
