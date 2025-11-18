import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { slideTemplateMap } from "../data/templates";
import SharedHeader from "@/components/SharedHeader";
import Toast from "@/components/Toast";
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
  const { projects, removeProject } = useProjects();
  const currentUser = useCurrentUser();

  const [highlightId, setHighlightId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timeout);
  }, [toast]);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [projects]);

  const displayedProjects = useMemo(() => {
    let filtered = orderedProjects;

    // Apply "mine" filter if active
    if (activeFilter === "mine" && currentUser) {
      filtered = filtered.filter((project) => {
        if (project.ownerId && project.ownerId === currentUser.id) return true;
        if (project.ownerEmail && currentUser.email) {
          return project.ownerEmail.toLowerCase() === currentUser.email.toLowerCase();
        }
        if (project.ownerName && currentUser.name) {
          return project.ownerName.toLowerCase() === currentUser.name.toLowerCase();
        }
        return false;
      });
    }

    // Apply search filter (prefix-based, real-time from first character)
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length > 0) {
      const query = trimmedQuery.toLowerCase();
      filtered = filtered.filter((project) => {
        const title = (project.name || "").toLowerCase();
        const description = (project.description || "").toLowerCase();
        const owner = (
          project.ownerName || 
          project.ownerEmail || 
          project.owner || 
          ""
        ).toLowerCase();
        
        return title.startsWith(query) || 
               description.startsWith(query) || 
               owner.startsWith(query);
      });
    }

    return filtered;
  }, [orderedProjects, activeFilter, currentUser, searchQuery]);

  return (
    <div className="projects-page min-h-screen bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] transition-[background,background-color] duration-500 ease-out">
      <SharedHeader variant="dashboard" />
      <main className="relative z-10 flex min-h-screen flex-col px-8 py-10 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="projects-action flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition dark:bg-[linear-gradient(90deg,#007B7F,#1A73E8)] dark:text-white dark:shadow-[0_0_15px_rgba(26,115,232,0.6)] dark:hover:shadow-[0_0_25px_rgba(26,115,232,0.8)] dark:hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="projects-heading text-3xl font-semibold text-[#1E1E1E] transition-colors duration-500 ease-out">Projects</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="projects-action rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition dark:bg-[linear-gradient(90deg,#007B7F,#1A73E8)] dark:text-white dark:shadow-[0_0_15px_rgba(26,115,232,0.6)] dark:hover:shadow-[0_0_25px_rgba(26,115,232,0.8)] dark:hover:scale-105"
          >
            New project
          </button>
        </div>

        <p className="projects-subtitle mt-6 text-sm text-black max-w-[520px] transition-colors duration-500 ease-out">
          Keep all saved decks at your fingertips. Select any card to continue where you left off.
        </p>

        <div className="mt-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or owner..."
              className="w-full rounded-full border border-white/60 bg-white/80 pl-12 pr-4 py-3 text-sm text-[#1E1E1E] placeholder:text-[#6B7280] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#3E6DCC]/50 focus:bg-white hover:bg-white/90 dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A] dark:text-white dark:placeholder:text-[#A0B4C0] dark:focus:ring-[#1A73E8]/50 dark:hover:bg-[#1A1A1A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#6B7280] hover:text-[#1E1E1E] transition-colors dark:text-[#A0B4C0] dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProjects.length === 0 ? (
            <div className="no-projects col-span-full rounded-2xl border-2 border-dashed border-white/60 bg-white/40 px-6 py-12 text-center text-[#6B7280] transition-colors duration-500 ease-out">
              {searchQuery.trim() || activeFilter === "mine" 
                ? "No projects match your search or filter. Try adjusting your search terms." 
                : "No projects yet. Create your first presentation to see it appear here."}
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
                  className={`project-card group relative rounded-[16px] border border-[#DCE3F6] bg-white/85 p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(62,109,204,0.25)]`}
                  style={isHighlighted ? { boxShadow: "0 0 0 3px rgba(62,109,204,0.35)" } : undefined}
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="project-title text-lg font-semibold text-[#1E1E1E] transition-colors duration-500 ease-out">{project.name}</h2>
                      <p className="project-meta mt-1 text-xs text-[#6B7280] transition-colors duration-500 ease-out">
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
                    className="project-description mt-4 h-[66px] text-sm text-[#6B7280] leading-relaxed overflow-hidden transition-colors duration-500 ease-out"
                    style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                  >
                    {project.description || "No description yet. Add context so teams know the story."}
                  </p>
                  <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280] transition-colors duration-500 ease-out dark:text-[#A0B4C0]">
                    <span className="project-owner flex items-center gap-2 transition-colors duration-500 ease-out">
                      Owner • {project.ownerName ?? project.owner ?? "You"}
                      {isMine && (
                        <span className="rounded-full bg-[#3E6DCC]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3E6DCC] dark:bg-[#1A73E8]/20 dark:text-[#9AA6B4]">
                          Mine
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/editor/${project.id}`)}
                        className="projects-action inline-flex items-center gap-1 rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-sm font-medium text-[#3E6DCC] transition group-hover:bg-[#3E6DCC]/15 dark:bg-[linear-gradient(90deg,#007B7F,#1A73E8)] dark:text-white dark:shadow-[0_0_15px_rgba(26,115,232,0.6)] dark:hover:shadow-[0_0_25px_rgba(26,115,232,0.8)] dark:hover:scale-105"
                      >
                        View
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75 15.75 8.25M9 8.25h6.75V15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#F87171]/60 px-3 py-1 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </footer>
                </article>
              );
            })
          )}
        </div>
      </main>
      <Toast message={toast} />

      {projectToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Delete this project?</h2>
            <p className="mt-2 text-sm text-[#4B5563]">
              This action can’t be undone. Are you sure you want to delete {projectToDelete.name}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeProject(projectToDelete.id);
                  setProjectToDelete(null);
                  setToast("✅ Project deleted successfully.");
                }}
                className="inline-flex items-center rounded-full bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#B91C1C]"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

