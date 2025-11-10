import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { slideTemplateMap } from "../templates/brandTemplates";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";

const backgroundLayers = [
  "linear-gradient(110deg, #0C7C59 0%, #00A19A 40%, #3E6DCC 100%)",
  "radial-gradient(125% 125% at 0% 0%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 65%)",
  "radial-gradient(120% 120% at 100% 100%, rgba(12,124,89,0.38) 0%, rgba(62,109,204,0.18) 35%, rgba(62,109,204,0) 70%)"
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
  const currentUser = useCurrentUser();

  const [highlightId, setHighlightId] = useState(null);

  const [activeFilter, setActiveFilter] = useState(location.state?.filter === "mine" ? "mine" : "all");

  useEffect(() => {
    if (location.state?.filter) {
      setActiveFilter(location.state.filter);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const displayedProjects = useMemo(() => {
    if (activeFilter !== "mine" || !currentUser) {
      return orderedProjects;
    }
    return orderedProjects.filter((project) => {
      if (project.ownerId && project.ownerId === currentUser.id) return true;
      if (project.ownerEmail && currentUser.email) {
        return project.ownerEmail.toLowerCase() === currentUser.email.toLowerCase();
      }
      if (project.ownerName && currentUser.name) {
        return project.ownerName.toLowerCase() === currentUser.name.toLowerCase();
      }
      return false;
    });
  }, [orderedProjects, activeFilter, currentUser]);

  return (
    <section className="min-h-screen relative font-['Poppins',ui-sans-serif] text-[#1E1E1E]">
      {backgroundLayers.map((layer) => (
        <div key={layer} aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: layer }} />
      ))}

      <div className="relative z-10 flex min-h-screen flex-col px-8 py-10 animate-fade-in">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-semibold text-[#1E1E1E]">Projects</h1>
          </div>
          <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
          <nav>
            <ul className="flex items-center gap-8 text-[#6B7280] font-medium">
              {"Home Notification Features About".split(" ").map((item) => (
                <li key={item} className="hover:opacity-80 transition">
                  {item}
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280]">
            Keep all saved decks at your fingertips. Select any card to continue where you left off.
          </p>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition"
          >
            New project
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-white/60 bg-white/40 px-6 py-12 text-center text-[#6B7280]">
              No projects yet. Create your first presentation to see it appear here.
            </div>
          ) : (
            displayedProjects.map((project) => {
              const isHighlighted = highlightId === project.id;
              const isMine =
                currentUser &&
                ((project.ownerId && project.ownerId === currentUser.id) ||
                  (project.ownerEmail &&
                    currentUser.email &&
                    project.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (project.ownerName &&
                    currentUser.name &&
                    project.ownerName.toLowerCase() === currentUser.name.toLowerCase()));
              return (
                <article
                  key={project.id}
                  className={`group relative rounded-[16px] border border-[#DCE3F6] bg-white/85 p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(62,109,204,0.25)]`}
                  style={isHighlighted ? { boxShadow: "0 0 0 3px rgba(62,109,204,0.35)" } : undefined}
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1E1E1E]">{project.name}</h2>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {slideTemplateMap[project.templateId]?.name ?? "Custom template"} • Updated {formatDisplayDate(project.updatedAt)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F4F8] text-[#3E6DCC] shadow-inner">
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
                    className="mt-4 h-[66px] text-sm text-[#6B7280] leading-relaxed overflow-hidden"
                    style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                  >
                    {project.description || "No description yet. Add context so teams know the story."}
                  </p>
                  <footer className="mt-5 flex items-center justify-between text-xs text-[#6B7280]">
                    <span className="flex items-center gap-2">
                      Owner • {project.ownerName ?? project.owner ?? "You"}
                      {isMine && (
                        <span className="rounded-full bg-[#3E6DCC]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3E6DCC]">
                          Mine
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/editor/${project.id}`)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-sm font-medium text-[#3E6DCC] transition group-hover:bg-[#3E6DCC]/15"
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

