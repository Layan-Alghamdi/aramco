import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cloneTemplateSlides, slideTemplates } from "../templates/brandTemplates";

const STORAGE_KEY = "savedProjects";

const [titleTemplate, textImageTemplate, twoColumnTemplate] = slideTemplates;

const normalizeObject = (object) => {
  if (!object) return object;
  const next = { ...object };
  if (next.type === "rect") {
    next.type = "shape";
    next.shape = "rectangle";
  }
  if (next.type === "ellipse") {
    next.type = "shape";
    next.shape = "circle";
  }
  if (next.type === "triangle") {
    next.type = "shape";
    next.shape = "triangle";
  }
  if (next.type === "text") {
    next.html = next.html ?? next.text ?? "";
    next.highlight = next.highlight ?? "transparent";
    next.fontFamily = next.fontFamily ?? "Poppins";
  }
  next.zIndex =
    typeof next.zIndex === "number"
      ? next.zIndex
      : next.zIndex
      ? Number(next.zIndex) || 1
      : 1;
  next.w = next.w ?? 320;
  next.h = next.h ?? 180;
  next.x = next.x ?? 160;
  next.y = next.y ?? 120;
  next.rot = next.rot ?? 0;
  return next;
};

const normalizeSlide = (slide) => ({
  ...slide,
  objects: (slide?.objects ?? []).map((object) => normalizeObject(object))
});

const normalizeProject = (project) => ({
  ...project,
  ownerId: project.ownerId ?? null,
  ownerName: project.ownerName ?? project.owner ?? "You",
  ownerEmail: project.ownerEmail ?? "",
  ownerRole: project.ownerRole ?? "",
  owner: project.owner ?? project.ownerName ?? "You",
  slides: (project?.slides ?? []).map((slide) => normalizeSlide(slide))
});

const normalizeProjects = (projects) => projects.map((project) => normalizeProject(project));

const DEFAULT_PROJECTS = normalizeProjects([
  {
    id: "geo-expansion",
    name: "Geo Expansion Deck",
    description: "Regional market outlook with AI-driven opportunity sizing.",
    ownerName: "Maha Al-Qahtani",
    ownerRole: "Transformation Lead",
    ownerEmail: "maha.alqahtani@aramco.com",
    updatedAt: "2025-10-29T09:00:00.000Z",
    createdAt: "2025-09-14T08:00:00.000Z",
    status: "In review",
    templateId: textImageTemplate.id,
    slides: cloneTemplateSlides(textImageTemplate.id)
  },
  {
    id: "ai-ops-health",
    name: "AI Ops Health Report",
    description: "Operational efficiency metrics and remediation roadmap.",
    ownerName: "Yousef Al-Ghamdi",
    ownerRole: "Operations Analyst",
    ownerEmail: "yousef.alghamdi@aramco.com",
    updatedAt: "2025-10-21T14:30:00.000Z",
    createdAt: "2025-09-30T08:00:00.000Z",
    status: "Draft",
    templateId: twoColumnTemplate.id,
    slides: cloneTemplateSlides(twoColumnTemplate.id)
  },
  {
    id: "stakeholder-kickoff",
    name: "Stakeholder Kickoff",
    description: "Executive alignment pack for program launch.",
    ownerId: "user-layan",
    ownerName: "Layan Alghamdi",
    ownerRole: "Lead Designer",
    ownerEmail: "layan.alghamdi@aramco.com",
    updatedAt: "2025-10-17T16:45:00.000Z",
    createdAt: "2025-08-22T08:00:00.000Z",
    status: "Signed off",
    templateId: titleTemplate.id,
    slides: cloneTemplateSlides(titleTemplate.id)
  }
]);

function loadProjects() {
  if (typeof window === "undefined") {
    return DEFAULT_PROJECTS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return normalizeProjects(parsed);
    }
    return DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

function persistProjects(projects) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn("Unable to persist projects", error);
  }
}

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => loadProjects());

  useEffect(() => {
    persistProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event) => {
      if (event.key === STORAGE_KEY) {
        setProjects(loadProjects());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addProject = useCallback((input) => {
    const now = new Date();
    const project = {
      id: input.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `project-${now.getTime()}`),
      name: input.name,
      description: input.description ?? "",
      ownerId: input.ownerId ?? null,
      ownerName: input.ownerName ?? input.owner ?? "You",
      ownerRole: input.ownerRole ?? "",
      ownerEmail: input.ownerEmail ?? "",
      status: input.status ?? "Draft",
      templateId: input.templateId ?? slideTemplates[0].id,
      slides: input.slides ?? cloneTemplateSlides(input.templateId ?? slideTemplates[0].id),
      createdAt: input.createdAt ?? now.toISOString(),
      updatedAt: input.updatedAt ?? now.toISOString()
    };

    const normalized = normalizeProject(project);
    setProjects((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateProject = useCallback((id, updates) => {
    const updatedAt = updates.updatedAt ?? new Date().toISOString();
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? {
              ...project,
              ...updates,
              slides: updates.slides ? normalizeProject({ slides: updates.slides }).slides : project.slides,
              updatedAt
            }
          : project
      )
    );
  }, []);

  const removeProject = useCallback((id) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      projects,
      addProject,
      updateProject,
      removeProject
    }),
    [projects, addProject, updateProject, removeProject]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

export { STORAGE_KEY as PROJECTS_STORAGE_KEY };

