import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { slideTemplateMap } from "../templates/brandTemplates";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useThemeMode from "../hooks/useThemeMode";

const lightBackgroundLayers = [
  "radial-gradient(115% 115% at 50% 50%, #E6EEFF 0%, #93B9FF 55%, #3E6DCC 100%)",
  "radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0) 60%)",
  "radial-gradient(110% 110% at 100% 100%, rgba(23,48,107,0.55) 0%, rgba(23,48,107,0.12) 40%, rgba(23,48,107,0) 70%)"
];

const darkBackgroundLayers = [
  "radial-gradient(135% 120% at 50% 50%, #0B1120 0%, #0F172A 55%, #172554 100%)",
  "radial-gradient(120% 120% at 0% 0%, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0.08) 35%, rgba(59,130,246,0) 65%)",
  "radial-gradient(140% 140% at 100% 100%, rgba(37,99,235,0.45) 0%, rgba(37,99,235,0.12) 40%, rgba(37,99,235,0) 70%)"
];

const formatDisplayDate = (isoString) => {
  if (!isoString) return "Just now";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return isoString;
  }
};

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects } = useProjects();
  const isDark = useThemeMode();

  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (location.state?.highlightProjectId) {
      setHighlightId(location.state.highlightProjectId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!highlightId) return;
    const timeout = setTimeout(() => setHighlightId(null), 2000);
    return () => clearTimeout(timeout);
  }, [highlightId]);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [projects]);

  return (
    <section className="min-h-screen relative font-['Poppins',ui-sans-serif] text-[#1E1E1E] dark:text-[#E4E9F6] transition-colors duration-300 ease-out">
      {(isDark ? darkBackgroundLayers : lightBackgroundLayers).map((layer) => (
        <div key={layer} aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: layer }} />
      ))}

      <div className="relative z-10 flex min-h-screen flex-col px-8 py-10 animate-fade-in">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition dark:bg-[#0F172A] dark:text-[#93C5FD] dark:border dark:border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-semibold text-[#1E1E1E] dark:text-white">Projects</h1>
          </div>
          <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
          <nav>
            <ul className="flex items-center gap-8 text-[#6B7280] font-medium dark:text-[#94A3B8]">
              {"Home Notification Features About".split(" ").map((item) => (
                <li key={item} className="hover:opacity-80 transition">
                  {item}
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280] dark:text-[#A5B4FC]">
            Keep all saved decks at your fingertips. Select any card to continue where you left off.
          </p>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition dark:bg-[#0F172A] dark:text-[#93C5FD] dark:border dark:border-white/10"
          >
            New project
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orderedProjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-white/60 bg-white/40 px-6 py-12 text-center text-[#6B7280] dark:border-white/10 dark:bg-[#0F172A]/70 dark:text-[#A5B4FC]">
              No projects yet. Create your first presentation to see it appear here.
            </div>
          ) : (
            orderedProjects.map((project) => {
              const isHighlighted = highlightId === project.id;
              return (
                <article
                  key={project.id}
                  className="group relative rounded-[16px] border border-[#DCE3F6] bg-white/85 p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(62,109,204,0.25)] dark:border-white/10 dark:bg-[#0F172A]/85 dark:shadow-[0_16px_40px_rgba(7,11,20,0.45)]"
                  style={isHighlighted ? { boxShadow: "0 0 0 3px rgba(62,109,204,0.35)" } : undefined}
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1E1E1E] dark:text-[#E4E9F6]">{project.name}</h2>
                      <p className="mt-1 text-xs text-[#6B7280] dark:text-[#A5B4FC]">
                        {slideTemplateMap[project.templateId]?.name ?? "Custom template"} • Updated {formatDisplayDate(project.updatedAt)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F4F8] text-[#3E6DCC] shadow-inner dark:bg-[#172554] dark:text-[#93C5FD]">
                      {project.assetDataUrl ? (
                        <img
                          src={project.assetDataUrl}
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h7l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 4v4a1 1 0 0 0 1 1h4" />
                        </svg>
                      )}
                    </div>
                  </header>
                  <p
                    className="mt-4 h-[66px] text-sm text-[#6B7280] leading-relaxed overflow-hidden dark:text-[#A5B4FC]"
                    style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                  >
                    {project.description || "No description yet. Add context so teams know the story."}
                  </p>
                  <footer className="mt-5 flex items-center justify-between text-xs text-[#6B7280] dark:text-[#94A3B8]">
                    <span>Owner • {project.owner ?? "You"}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/editor/${project.id}`)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-sm font-medium text-[#3E6DCC] transition group-hover:bg-[#3E6DCC]/15 dark:bg-[#2563EB]/10 dark:text-[#93C5FD] dark:group-hover:bg-[#2563EB]/15"
                    >
                      View
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75 15.75 8.25M9 8.25h6.75V15" />
                      </svg>
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

