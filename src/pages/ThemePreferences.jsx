import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyTheme, loadThemePreference, setThemePreference } from "@/lib/theme";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useThemeMode from "@/hooks/useThemeMode";

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
  const themeMode = useThemeMode();
  const isDark = useMemo(() => themeMode === "dark", [themeMode]);
  const lightBackground = "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)";

  useEffect(() => {
    const theme = loadThemePreference();
    setSelectedTheme(theme);
    setInitialPreference(theme);
    applyTheme(theme);
  }, []);

  useEffect(() => {
    document.body.classList.add("theme-preferences-surface");
    return () => {
      document.body.classList.remove("theme-preferences-surface");
      document.body.classList.remove("dark-theme-preferences");
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-theme-preferences");
    } else {
      document.body.classList.remove("dark-theme-preferences");
    }
  }, [isDark]);

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
      className="theme-preferences-shell min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-['Poppins',ui-sans-serif] text-[#1E1E1E] transition-colors duration-500 ease-gentle-spring"
      style={isDark ? undefined : { background: lightBackground }}
    >
      <div className="theme-preferences-frame relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div className="theme-preferences-overlay absolute inset-0 bg-white transition-colors duration-500 ease-gentle-spring" aria-hidden="true" />

        <div className="theme-preferences-inner relative z-10 flex h-full flex-col px-10 pt-8 pb-12">
          <header className="theme-preferences-header flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={handleCancel}
              className="theme-preferences-back inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-[#F3F4F6]"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <form
              onSubmit={handleSave}
              className="theme-preferences-card w-full max-w-[700px] space-y-10 rounded-[28px] border border-[#E5E7EB] bg-white/90 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)] transition-all duration-500 ease-gentle-spring"
            >
              <div className="space-y-2 text-center">
                <h1 className="theme-preferences-title text-3xl font-semibold text-[#0A0A0A] transition-colors duration-500">
                  Theme Preferences
                </h1>
                <p className="theme-preferences-description text-sm text-[#6B7280] transition-colors duration-500">
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
                      className={`theme-card group relative flex flex-col items-start gap-4 rounded-[24px] border px-5 py-6 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50 ${
                        isActive ? "theme-card--active border-[#2563EB] bg-[#EBF2FF]" : "theme-card--idle border-[#E2E8F0] bg-white hover:border-[#CBD5F5]"
                      }`}
                    >
                      <span className="theme-card-label inline-flex items-center gap-2 rounded-full border border-[#CBD5F5] bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] transition-colors duration-500">
                        {isActive ? "Selected" : "Preview"}
                      </span>
                      <div
                        className="theme-card-preview h-28 w-full rounded-2xl shadow-inner"
                        style={{ background: theme.preview }}
                        aria-hidden="true"
                      />
                      <div className="space-y-2">
                        <h2 className="theme-card-title text-lg font-semibold text-[#111827] transition-colors duration-500">
                          {theme.title}
                        </h2>
                        <p className="theme-card-description text-sm text-[#6B7280] leading-relaxed transition-colors duration-500">
                          {theme.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {status && (
                <p className="theme-preferences-status rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 text-center">
                  {status}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="theme-preferences-cancel rounded-full border border-[#D1D5DB] bg-white px-6 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="theme-preferences-save rounded-full bg-gradient-to-r from-brandEmerald-500 to-brandBlue-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(27,21,51,0.25)] transition hover:opacity-90"
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
