import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { cloneTemplateSlides, slideTemplates } from "../data/templates";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import VideoPlayer from "../components/VideoPlayer";
import useCurrentUser from "@/hooks/useCurrentUser";
import { recordProjectForUser } from "@/lib/usersStore";

const uuid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}`);

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

const PRESET_COLORS = [
  "#0C7C59",
  "#3E6DCC",
  "#A9C7FF",
  "#00A19A",
  "#6B7280",
  "#1E1E1E",
  "#E6EEFF",
  "#FFFFFF"
];

const DEFAULT_TEXT_PROPS = {
  fontSize: 32,
  fontWeight: 500,
  italic: false,
  underline: false,
  align: "left",
  color: "#1E1E1E",
  lineHeight: 1.25
};

const gradientBackground =
  "linear-gradient(110deg, #0C7C59 0%, #00A19A 40%, #3E6DCC 100%)";

const GRID_SIZE = 10;
const MIN_SIZE = 48;

const BRAND_COLORS = ["#0C7C59", "#3E6DCC", "#A9C7FF", "#E6EEFF", "#FFFFFF", "#1E1E1E"];

const RESIZE_HANDLES = [
  { key: "top-left", cursor: "nwse-resize", className: "top-0 left-0 -translate-x-1/2 -translate-y-1/2" },
  { key: "top", cursor: "ns-resize", className: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { key: "top-right", cursor: "nesw-resize", className: "top-0 right-0 translate-x-1/2 -translate-y-1/2" },
  { key: "right", cursor: "ew-resize", className: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2" },
  { key: "bottom-right", cursor: "nwse-resize", className: "bottom-0 right-0 translate-x-1/2 translate-y-1/2" },
  { key: "bottom", cursor: "ns-resize", className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
  { key: "bottom-left", cursor: "nesw-resize", className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2" },
  { key: "left", cursor: "ew-resize", className: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" }
];

const defaultSlide = () => ({
  id: uuid(),
  title: "Untitled",
  objects: [
    {
      id: `txt-${uuid()}`,
      type: "text",
      x: 180,
      y: 160,
      w: 600,
      h: 200,
      rot: 0,
      text: "Double-click to add your content",
      html: "Double-click to add your content",
      fontFamily: "Poppins",
      ...DEFAULT_TEXT_PROPS,
      align: "center",
      highlight: "transparent",
      zIndex: Date.now()
    }
  ]
});

export default function Editor() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, updateProject, addProject } = useProjects();
  const currentUser = useCurrentUser();

  const initialProject = useMemo(() => projects.find((item) => item.id === projectId), [projects, projectId]);

  // Project state with editable title (current editing state)
  const [project, setProject] = useState({
    id: initialProject?.id || projectId || "",
    title: initialProject?.name || "Untitled project",
    description: initialProject?.description || "",
    templateId: initialProject?.templateId || slideTemplates[0].id,
    slides: initialProject?.slides || []
  });

  // Last saved draft state (snapshot saved with Save button)
  const [lastSavedProject, setLastSavedProject] = useState(() => {
    if (initialProject) {
      return {
        id: initialProject.id,
        title: initialProject.name || "Untitled project",
        description: initialProject.description || "",
        templateId: initialProject.templateId || slideTemplates[0].id,
        slides: initialProject.slides || []
      };
    }
    return null;
  });

  // Update project state when initialProject changes
  useEffect(() => {
    if (initialProject) {
      const projectData = {
        id: initialProject.id,
        title: initialProject.name || "Untitled project",
        description: initialProject.description || "",
        templateId: initialProject.templateId || slideTemplates[0].id,
        slides: initialProject.slides || []
      };
      setProject(projectData);
      setLastSavedProject(projectData);
    } else if (projectId && !project.id) {
      // If we have a projectId but no initialProject, set the id
      setProject((prev) => ({
        ...prev,
        id: projectId
      }));
    }
  }, [initialProject, projectId, project.id]);

  const [slides, setSlides] = useState(() => project?.slides ?? [defaultSlide()]);
  const [activeSlideId, setActiveSlideId] = useState(() => slides[0]?.id);
  const [selectedIds, setSelectedIds] = useState([]);
  const [colorPanel, setColorPanel] = useState({
    open: false,
    top: 0,
    left: 0
  });
  const [recentColors, setRecentColors] = useState([]);
  const [isOffline, setIsOffline] = useState(typeof window !== "undefined" ? !navigator.onLine : false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveState, setSaveState] = useState("saved");
  const [lastSavedAt, setLastSavedAt] = useState(() => Date.now());
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [aiInsights, setAiInsights] = useState({});
  const [highlightedIssueId, setHighlightedIssueId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [highlightColor, setHighlightColor] = useState("#FDE68A");
  const [interaction, setInteraction] = useState(null);

  const colorButtonRef = useRef(null);
  const inspectorColorRef = useRef(null);
  const colorPanelRef = useRef(null);
  const slideWrapperRef = useRef(null);
  const editableRefs = useRef(new Map());
  const fileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);
  const interactionRef = useRef(interaction);
  const slidesRef = useRef(slides);
  const saveTimeoutRef = useRef(null);
  const hasRestoredPending = useRef(false);

  useEffect(() => {
    if (isOffline) {
      setSaveState("offline");
    }
  }, [isOffline]);

  useEffect(() => {
    interactionRef.current = interaction;
  }, [interaction]);

  useEffect(() => {
    if (!initialProject) return;
    const nextSlides = initialProject.slides && initialProject.slides.length > 0 ? initialProject.slides : [defaultSlide()];
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0]?.id);
  }, [initialProject]);

  const activeSlide = useMemo(
    () => slides.find((slide) => slide.id === activeSlideId) ?? slides[0],
    [slides, activeSlideId]
  );

  // Handle smooth slide transitions
  useEffect(() => {
    if (!activeSlideId) return;
    
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 200); // 200ms transition duration

    return () => clearTimeout(timer);
  }, [activeSlideId]);

  const selectedObjects = useMemo(() => {
    if (!activeSlide) return [];
    return activeSlide.objects.filter((obj) => selectedIds.includes(obj.id));
  }, [activeSlide, selectedIds]);

  const selectedTextObject = useMemo(() => {
    if (selectedObjects.length !== 1) return null;
    const obj = selectedObjects[0];
    if (obj.type !== "text") return null;
    return obj;
  }, [selectedObjects]);

  const hasSelection = selectedObjects.length > 0;
  const selectedObject = selectedObjects[0] ?? null;
  const pendingStorageKey = useMemo(() => (project.id ? `pendingSlides_${project.id}` : null), [project.id]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    setHighlightedIssueId(null);
  }, [activeSlideId]);
  const analyzeSlides = useCallback((slidesList) => {
    const result = {};
    slidesList.forEach((slide) => {
      const objects = slide?.objects ?? [];
      const issues = [];
      const texts = objects.filter((obj) => obj.type === "text");

      const clampCoord = (value, min, max) => Math.min(Math.max(value, min), max);
      const issuePosition = (obj) => ({
        x: clampCoord(obj.x + obj.w - 22, 10, SLIDE_WIDTH - 30),
        y: clampCoord(obj.y - 18, 10, SLIDE_HEIGHT - 34)
      });

      if (texts.length >= 2) {
        const centers = texts.map((text) => text.x + text.w / 2);
        const meanCenter = centers.reduce((sum, value) => sum + value, 0) / centers.length;
        centers.forEach((center, index) => {
          if (Math.abs(center - meanCenter) > 32) {
            const obj = texts[index];
            const pos = issuePosition(obj);
            issues.push({
              id: `${slide.id}-${obj.id}-alignment`,
              objectId: obj.id,
              message: "Consider aligning this text with the body content for better balance.",
              ...pos
            });
          }
        });

        const fontCounts = {};
        texts.forEach((text) => {
          const font = (text.fontFamily || "Poppins").toLowerCase();
          fontCounts[font] = (fontCounts[font] || 0) + 1;
        });
        const [primaryFont] =
          Object.entries(fontCounts).sort(([, a], [, b]) => b - a)[0] ?? [];
        texts.forEach((text) => {
          const font = (text.fontFamily || "Poppins").toLowerCase();
          if (primaryFont && font !== primaryFont) {
            const pos = issuePosition(text);
            issues.push({
              id: `${slide.id}-${text.id}-font`,
              objectId: text.id,
              message: `Font "${text.fontFamily || "Default"}" differs from other text on this slide.`,
              ...pos
            });
          }
        });
      }

      const addedOverlap = new Set();
      for (let i = 0; i < objects.length; i += 1) {
        for (let j = i + 1; j < objects.length; j += 1) {
          const a = objects[i];
          const b = objects[j];
          const left = Math.max(a.x, b.x);
          const right = Math.min(a.x + a.w, b.x + b.w);
          const top = Math.max(a.y, b.y);
          const bottom = Math.min(a.y + a.h, b.y + b.h);
          const overlapW = right - left;
          const overlapH = bottom - top;
          if (overlapW > 0 && overlapH > 0) {
            const overlapArea = overlapW * overlapH;
            const smallerArea = Math.min(a.w * a.h, b.w * b.h);
            if (overlapArea > smallerArea * 0.2) {
              const keyA = `${slide.id}-${a.id}-overlap-${b.id}`;
              const keyB = `${slide.id}-${b.id}-overlap-${a.id}`;
              if (!addedOverlap.has(keyA)) {
                const posA = issuePosition(a);
                issues.push({
                  id: keyA,
                  objectId: a.id,
                  message: "These elements overlap. Try spacing them apart.",
                  ...posA
                });
                addedOverlap.add(keyA);
              }
              if (!addedOverlap.has(keyB)) {
                const posB = issuePosition(b);
                issues.push({
                  id: keyB,
                  objectId: b.id,
                  message: "These elements overlap. Try spacing them apart.",
                  ...posB
                });
                addedOverlap.add(keyB);
              }
            }
          }
        }
      }

      const colorValues = new Set();
      objects.forEach((object) => {
        const color = (object.type === "text" ? object.color : object.fill) ?? null;
        if (color) {
          colorValues.add(color.toLowerCase());
        }
      });
      if (colorValues.size > 6) {
        issues.push({
          id: `${slide.id}-palette`,
          objectId: null,
          message: "This slide uses many colors—consider simplifying the palette.",
          x: 20,
          y: 20
        });
      }

      result[slide.id] = issues;
    });
    return result;
  }, []);

  useEffect(() => {
    setAiInsights(analyzeSlides(slides));
  }, [slides, analyzeSlides]);

  const generateAiSuggestions = useCallback(() => {
    if (!activeSlide) return [];
    const suggestions = [];
    const objects = activeSlide.objects ?? [];
    const textObjects = objects.filter((object) => object.type === "text");
    const combinedText = textObjects.map((text) => text.text || "").join(" ");
    const wordCount = combinedText.split(/\s+/).filter(Boolean).length;

    if (textObjects.length >= 3 && wordCount > 120) {
      suggestions.push({
        id: `${activeSlide.id}-layout`,
        category: "Layout",
        message: "Try a two-column layout to improve readability."
      });
    }

    if (textObjects.length > 0) {
      const titleCandidate = [...textObjects].sort((a, b) => a.y - b.y)[0];
      if (titleCandidate && (titleCandidate.text || "").length >= 12) {
        const original = titleCandidate.text.trim();
        const alternative =
          original.slice(0, 1).toUpperCase() +
          original
            .slice(1)
            .replace(/202(\d)/, "20$10+")
            .replace(/report/i, "insights")
            .replace(/analysis/i, "blueprint");
        if (alternative && alternative !== original) {
          suggestions.push({
            id: `${activeSlide.id}-title`,
            category: "Headline",
            message: `Try a more action-oriented title, e.g., “${alternative}”.`
          });
        }
      }
    }

    const keywordText = combinedText.toLowerCase();
    if (/\b(ai|automation|machine learning|digital)\b/.test(keywordText)) {
      suggestions.push({
        id: `${activeSlide.id}-visuals`,
        category: "Visual",
        message: "Add an AI-themed illustration or icon to reinforce the message."
      });
    } else if (/\bfinance|growth|sales|report|strategy\b/.test(keywordText)) {
      suggestions.push({
        id: `${activeSlide.id}-visuals-generic`,
        category: "Visual",
        message: "Consider adding supporting icons or charts that match the topic."
      });
    }

    if (objects.length >= 4 && objects.some((object) => object.type === "shape")) {
      suggestions.push({
        id: `${activeSlide.id}-animation`,
        category: "Motion",
        message: "Use subtle entrance animations to reveal each element in sequence."
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        id: `${activeSlide.id}-no-suggestions`,
        category: "Ideas",
        message: "This slide looks balanced. Try adding a supporting quote or statistic."
      });
    }

    return suggestions;
  }, [activeSlide]);

  useEffect(() => {
    setAiSuggestions(generateAiSuggestions());
  }, [generateAiSuggestions]);

  useEffect(() => {
    if (!pendingStorageKey || hasRestoredPending.current || typeof window === "undefined") return;
    const cached = localStorage.getItem(pendingStorageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.slides) {
          setSlides(parsed.slides);
        }
      } catch (error) {
        console.warn("Unable to restore cached slides", error);
      }
    }
    hasRestoredPending.current = true;
  }, [pendingStorageKey]);


  const computeNextZIndex = useCallback(() => {
    let max = 0;
    slides.forEach((slide) => {
      slide.objects.forEach((obj) => {
        max = Math.max(max, obj.zIndex ?? 1);
      });
    });
    return max + 1;
  }, [slides]);

  const beginInteraction = useCallback((payload) => {
    interactionRef.current = payload;
    setInteraction(payload);
  }, []);

  const cachePendingSlides = useCallback(() => {
    if (!pendingStorageKey || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        pendingStorageKey,
        JSON.stringify({ slides: slidesRef.current, updatedAt: Date.now() })
      );
    } catch (error) {
      console.warn("Unable to cache pending slides", error);
    }
  }, [pendingStorageKey]);

  const clearPendingSlides = useCallback(() => {
    if (!pendingStorageKey || typeof window === "undefined") return;
    try {
      localStorage.removeItem(pendingStorageKey);
    } catch (error) {
      console.warn("Unable to clear pending slides", error);
    }
  }, [pendingStorageKey]);

  // Save draft locally (does not publish to Projects list)
  const performSave = useCallback(async () => {
    if (isOffline || isSaving) return;
    
    setIsSaving(true);
    setSaveState("saving");
    try {
      // Save current state as draft snapshot
      const draftSnapshot = {
        id: project.id || projectId || "",
        title: project.title || "Untitled project",
        description: project.description || "",
        templateId: project.templateId || slideTemplates[0].id,
        slides: [...slidesRef.current]
      };
      
      setLastSavedProject(draftSnapshot);
      setLastSavedAt(Date.now());
      setPendingChanges(false);
      setSaveState("saved");
      setHasUnsavedChanges(false);
      setIsSaved(true);
      clearPendingSlides();
    } catch (error) {
      console.error("Failed to save draft", error);
      setSaveState("error");
      setIsSaved(false);
    } finally {
      setIsSaving(false);
      saveTimeoutRef.current = null;
    }
  }, [project, projectId, isOffline, isSaving, clearPendingSlides]);

  // Publish to Projects list (called when leaving editor)
  const publishToProjects = useCallback(async (useCurrentState = false) => {
    // Use lastSavedProject if available and not forcing current state, otherwise use current project
    const projectToPublish = (!useCurrentState && lastSavedProject) ? lastSavedProject : {
      id: project.id || projectId || "",
      title: project.title || "Untitled project",
      description: project.description || "",
      templateId: project.templateId || slideTemplates[0].id,
      slides: slidesRef.current
    };

    const targetProjectId = projectToPublish.id;
    if (!targetProjectId) {
      console.error("Cannot publish: no project ID");
      return;
    }

    try {
      const projectExists = projects.some((p) => p.id === targetProjectId);
      
      if (projectExists) {
        // Update existing project in Projects list
        updateProject(targetProjectId, {
          name: projectToPublish.title,
          description: projectToPublish.description,
          slides: projectToPublish.slides,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new project in Projects list
        const newProject = addProject({
          id: targetProjectId,
          name: projectToPublish.title,
          description: projectToPublish.description,
          templateId: projectToPublish.templateId || slideTemplates[0].id,
          slides: projectToPublish.slides,
          status: "Draft",
          ownerId: currentUser?.id ?? null,
          ownerName: currentUser?.name ?? "You",
          ownerEmail: currentUser?.email ?? "",
          ownerRole: currentUser?.role ?? ""
        });

        if (currentUser?.id) {
          recordProjectForUser(currentUser.id, newProject.id);
        }
      }
    } catch (error) {
      console.error("Failed to publish project", error);
    }
  }, [lastSavedProject, project, projectId, projects, updateProject, addProject, currentUser]);

  // Revert to last saved draft
  const revertToLastSaved = useCallback(() => {
    if (!lastSavedProject) return;
    
    setProject({
      id: lastSavedProject.id,
      title: lastSavedProject.title,
      description: lastSavedProject.description,
      templateId: lastSavedProject.templateId,
      slides: lastSavedProject.slides
    });
    setSlides(lastSavedProject.slides);
    setActiveSlideId(lastSavedProject.slides[0]?.id);
    setHasUnsavedChanges(false);
    setIsSaved(true);
  }, [lastSavedProject]);

  const scheduleSave = useCallback(
    (immediate = false) => {
      if (isOffline) return;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setSaveState("saving");
      saveTimeoutRef.current = window.setTimeout(() => {
        performSave();
      }, immediate ? 0 : 600);
    },
    [isOffline, performSave]
  );

  const updateObject = useCallback(
    (objectId, updater) => {
      if (!objectId || typeof updater !== "function") return;
      setSlides((prev) =>
        prev.map((slide) => {
          let changed = false;
          const objects = slide.objects.map((object) => {
            if (object.id !== objectId) return object;
            const next = { ...object, ...updater(object) };
            changed = true;
            return next;
          });
          return changed ? { ...slide, objects } : slide;
        })
      );
    },
    [setSlides]
  );

  const replaceObjectsForSlide = useCallback((slideId, updater) => {
    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== slideId) return slide;
        const objects = updater(slide.objects);
        return objects === slide.objects ? slide : { ...slide, objects };
      })
    );
  }, []);

  const addObjectToActiveSlide = useCallback(
    (object) => {
      if (!object || !activeSlide) return;
      const newObject = {
        id: object.id ?? `obj-${uuid()}`,
        x: object.x ?? 180,
        y: object.y ?? 160,
        w: object.w ?? 320,
        h: object.h ?? 180,
        rot: object.rot ?? 0,
        zIndex: object.zIndex ?? computeNextZIndex(),
        ...object
      };

      replaceObjectsForSlide(activeSlide.id, (objects) => [...objects, newObject]);
      setSelectedIds([newObject.id]);
    },
    [activeSlide, computeNextZIndex, replaceObjectsForSlide]
  );

  const deleteObject = useCallback(
    (objectId) => {
      if (!objectId || !activeSlide) return;
      replaceObjectsForSlide(activeSlide.id, (objects) => objects.filter((object) => object.id !== objectId));
      setSelectedIds([]);
    },
    [activeSlide, replaceObjectsForSlide]
  );

  const duplicateObject = useCallback(() => {
    if (!selectedObject) return;
    const clone = {
      ...selectedObject,
      id: `obj-${uuid()}`,
      x: selectedObject.x + 24,
      y: selectedObject.y + 24,
      zIndex: computeNextZIndex()
    };
    addObjectToActiveSlide(clone);
  }, [addObjectToActiveSlide, computeNextZIndex, selectedObject]);

  const bringForward = useCallback(() => {
    if (!selectedObject || !activeSlide) return;
    replaceObjectsForSlide(activeSlide.id, (objects) => {
      const index = objects.findIndex((obj) => obj.id === selectedObject.id);
      if (index === -1 || index === objects.length - 1) return objects;
      const next = [...objects];
      const [item] = next.splice(index, 1);
      next.splice(index + 1, 0, item);
      return next;
    });
  }, [activeSlide, replaceObjectsForSlide, selectedObject]);

  const sendBackward = useCallback(() => {
    if (!selectedObject || !activeSlide) return;
    replaceObjectsForSlide(activeSlide.id, (objects) => {
      const index = objects.findIndex((obj) => obj.id === selectedObject.id);
      if (index <= 0) return objects;
      const next = [...objects];
      const [item] = next.splice(index, 1);
      next.splice(index - 1, 0, item);
      return next;
    });
  }, [activeSlide, replaceObjectsForSlide, selectedObject]);

  const snapValue = useCallback(
    (value) => (snapEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value),
    [snapEnabled]
  );

  const clamp = useCallback((value, min, max) => Math.min(Math.max(value, min), max), []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!colorPanel.open) return;

      const panelEl = colorPanelRef.current;
      const toolbarBtn = colorButtonRef.current;
      const inspectorBtn = inspectorColorRef.current;
      const target = event.target;

      if (panelEl && panelEl.contains(target)) return;
      if (toolbarBtn && toolbarBtn.contains(target)) return;
      if (inspectorBtn && inspectorBtn.contains(target)) return;

      setColorPanel((prev) => ({ ...prev, open: false }));
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorPanel.open]);

  useEffect(() => {
    if (!interaction) return;

    const handlePointerMove = (event) => {
      const data = interactionRef.current;
      if (!data) return;
      const deltaX = event.clientX - data.startX;
      const deltaY = event.clientY - data.startY;

      if (data.type === "drag") {
        const nextX = clamp(snapValue(data.initial.x + deltaX), 0, SLIDE_WIDTH - data.initial.w);
        const nextY = clamp(snapValue(data.initial.y + deltaY), 0, SLIDE_HEIGHT - data.initial.h);
        updateObject(data.objectId, () => ({ x: nextX, y: nextY }));
      } else if (data.type === "resize") {
        let { x, y, w, h } = data.initial;
        if (data.handle.includes("right")) {
          w = data.initial.w + deltaX;
        }
        if (data.handle.includes("left")) {
          w = data.initial.w - deltaX;
          x = data.initial.x + deltaX;
        }
        if (data.handle.includes("bottom")) {
          h = data.initial.h + deltaY;
        }
        if (data.handle.includes("top")) {
          h = data.initial.h - deltaY;
          y = data.initial.y + deltaY;
        }

        w = snapValue(Math.max(MIN_SIZE, w));
        h = snapValue(Math.max(MIN_SIZE, h));
        x = clamp(snapValue(x), 0, SLIDE_WIDTH - w);
        y = clamp(snapValue(y), 0, SLIDE_HEIGHT - h);

        updateObject(data.objectId, () => ({ x, y, w, h }));
      }
    };

    const handlePointerUp = () => {
      setInteraction(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [clamp, interaction, snapValue, updateObject]);

  const openColorPanel = (anchorEl) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setColorPanel({
      open: true,
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  };

  const toggleToolbarColorPanel = () => {
    if (colorPanel.open) {
      setColorPanel((prev) => ({ ...prev, open: false }));
      return;
    }
    if (!colorButtonRef.current) return;
    openColorPanel(colorButtonRef.current);
  };

  const applyColor = (color) => {
    if (!activeSlide || selectedIds.length === 0) return;

    selectedIds.forEach((objectId) => {
      updateObject(objectId, (obj) => {
        if (obj.type === "text") {
          return { color };
        }
        if (["shape", "rect", "ellipse", "triangle"].includes(obj.type)) {
          return { fill: color };
        }
        if (["line", "arrow"].includes(obj.type)) {
          return { stroke: color };
        }
        if (obj.type === "chart") {
          return { accentColor: color };
        }
        return {};
      });
    });

    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 4);
    });
  };

  const handleSwatchClick = (color) => {
    applyColor(color);
  };

  const handleCustomColorChange = (event) => {
    const color = event.target.value;
    if (!color) return;
    applyColor(color);
  };

  const handleCanvasBackgroundClick = () => {
    setSelectedIds([]);
    setInteraction(null);
  };

  const handleObjectMouseDown = (event, object) => {
    if (!object) return;
    event.stopPropagation();

    const isTextSurface = event.target?.dataset?.editable === "true";
    if (isTextSurface) {
      setSelectedIds([object.id]);
      return;
    }

    event.preventDefault();
    setSelectedIds([object.id]);
    beginInteraction({
      type: "drag",
      objectId: object.id,
      startX: event.clientX,
      startY: event.clientY,
      initial: { x: object.x, y: object.y, w: object.w, h: object.h }
    });
  };

  const handleResizePointerDown = (event, object, handle) => {
    if (!object) return;
    event.stopPropagation();
    event.preventDefault();
    setSelectedIds([object.id]);
    beginInteraction({
      type: "resize",
      objectId: object.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      initial: { x: object.x, y: object.y, w: object.w, h: object.h }
    });
  };

  const assignEditableRef = useCallback((objectId, element) => {
    if (!element) {
      editableRefs.current.delete(objectId);
    } else {
      editableRefs.current.set(objectId, element);
    }
  }, []);

  const updateSelectedText = (updater) => {
    if (!selectedTextObject || typeof updater !== "function") return;
    updateObject(selectedTextObject.id, (obj) => updater(obj) ?? {});
  };

  const handleTextInput = (objectId, event) => {
    const html = event.currentTarget.innerHTML;
    const value = event.currentTarget.innerText;
    updateObject(objectId, () => ({ html, text: value }));
  };

  const handleTextKeyDown = (objectId, event) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modifierHeld = isMac ? event.metaKey : event.ctrlKey;

    if (!modifierHeld) return;

    if (["b", "i", "u", "B", "I", "U"].includes(event.key)) {
      event.preventDefault();
      updateObject(objectId, (obj) => {
        if (event.key.toLowerCase() === "b") {
          const weight = obj.fontWeight === 700 ? 400 : 700;
          return { fontWeight: weight };
        }
        if (event.key.toLowerCase() === "i") {
          return { italic: !obj.italic };
        }
        if (event.key.toLowerCase() === "u") {
          return { underline: !obj.underline };
        }
        return {};
      });
    }
  };

  const applyTextCommand = useCallback(
    (command, value) => {
      const targetId = selectedIds[0];
      if (!targetId) return;
      if (typeof document === "undefined") return;
      const editable = editableRefs.current.get(targetId);
      if (!editable) return;
      editable.focus();
      try {
        document.execCommand(command, false, value);
      } catch (error) {
        console.warn("Rich text command failed", command, error);
      }
      const html = editable.innerHTML;
      const text = editable.innerText;
      updateObject(targetId, () => ({ html, text }));
    },
    [selectedIds, updateObject]
  );

  const handleHighlightSelection = (color) => {
    setHighlightColor(color);
    applyTextCommand("backColor", color);
    if (selectedObject?.type === "text") {
      updateObject(selectedObject.id, () => ({ highlight: color }));
    }
  };

  const handleListToggle = (listType) => {
    if (listType === "ordered") {
      applyTextCommand("insertOrderedList");
    } else {
      applyTextCommand("insertUnorderedList");
    }
  };

  const handleAddTextBox = () => {
    addObjectToActiveSlide({
      type: "text",
      text: "Headline",
      html: "Headline",
      fontFamily: "Poppins",
      fontSize: 36,
      fontWeight: 600,
      color: "#1E1E1E",
      align: "left",
      lineHeight: 1.35,
      highlight: "transparent",
      w: 420,
      h: 180
    });
  };

  const handleAddShape = (variant) => {
    const shapes = {
      rectangle: { shape: "rectangle", w: 320, h: 200, fill: "#E6EEFF", stroke: "#3E6DCC", strokeWidth: 2, radius: 28 },
      circle: { shape: "circle", w: 220, h: 220, fill: "#A9C7FF", stroke: "#3E6DCC", strokeWidth: 2 },
      triangle: { shape: "triangle", w: 220, h: 200, fill: "#00A19A" },
      arrow: { shape: "arrow", w: 280, h: 160, fill: "#3E6DCC" }
    };
    const base = shapes[variant];
    if (!base) return;
    addObjectToActiveSlide({
      type: "shape",
      ...base
    });
  };

  const handleFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addObjectToActiveSlide({
        type: "image",
        src: reader.result,
        alt: file.name,
        w: 420,
        h: 280,
        maintainAspect: true
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleVideoUploadClick = () => {
    videoFileInputRef.current?.click();
  };

  const handleVideoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      addObjectToActiveSlide(
        createVideoObject({
          sourceType: "upload",
          src: result,
          fileName: file.name
        })
      );
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleAddImageFromUrl = () => {
    const url = window.prompt("Paste image URL");
    if (!url) return;
    addObjectToActiveSlide({
      type: "image",
      src: url,
      alt: "Linked image",
      w: 420,
      h: 280,
      maintainAspect: true
    });
  };

  const handleAddChart = (chartType) => {
    addObjectToActiveSlide({
      type: "chart",
      chartType,
      w: 420,
      h: 260,
      accentColor: "#3E6DCC",
      background: "#FFFFFF",
      data: []
    });
  };

  const createVideoObject = ({ sourceType, src, fileName }) => ({
    type: "video",
    sourceType,
    src: src ?? "",
    fileName: fileName ?? "",
    autoplay: false,
    loop: false,
    muted: true,
    poster: "",
    playbackRate: 1,
    w: 420,
    h: 260,
    zIndex: computeNextZIndex()
  });

  const detectExternalVideoSource = (url) => {
    if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
    if (/vimeo\.com/i.test(url)) return "vimeo";
    return "url";
  };

  const handleEmbedVideoPrompt = () => {
    const url = window.prompt("Paste video URL (YouTube, Vimeo, or direct MP4)");
    if (!url) return;
    addObjectToActiveSlide(
      createVideoObject({
        sourceType: detectExternalVideoSource(url),
        src: url
      })
    );
  };
  const handleApplyBrandColor = (color) => {
    if (!selectedObject) {
      applyColor(color);
      return;
    }
    if (selectedObject.type === "text") {
      updateObject(selectedObject.id, () => ({ color }));
    } else {
      updateObject(selectedObject.id, (obj) => {
        if (["shape", "rect", "ellipse", "triangle"].includes(obj.type)) {
          return { fill: color };
        }
        if (obj.type === "chart") {
          return { accentColor: color };
        }
        return {};
      });
    }
  };

  const handleDeleteSelection = () => {
    if (!selectedObject) return;
    deleteObject(selectedObject.id);
  };

  const handleAiAssist = () => {
    window.alert("AI layout suggestions are coming soon.");
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Track unsaved changes when slides or project title changes (compare with lastSavedProject)
  useEffect(() => {
    if (!lastSavedProject) {
      // If no saved draft yet, check if we have any changes from initial
      if (initialProject) {
        const slidesChanged = JSON.stringify(slides) !== JSON.stringify(initialProject.slides || []);
        const titleChanged = project.title !== (initialProject.name || "Untitled project");
        setHasUnsavedChanges(slidesChanged || titleChanged);
      } else {
        // New project, check if we have any content
        const hasContent = slides.length > 0 && slides[0].objects.length > 0;
        const hasTitle = project.title && project.title !== "Untitled project";
        setHasUnsavedChanges(hasContent || hasTitle);
      }
      return;
    }
    
    // Compare current state with last saved draft
    const slidesChanged = JSON.stringify(slides) !== JSON.stringify(lastSavedProject.slides || []);
    const titleChanged = project.title !== lastSavedProject.title;
    const descriptionChanged = project.description !== lastSavedProject.description;
    const hasChanges = slidesChanged || titleChanged || descriptionChanged;
    setHasUnsavedChanges(hasChanges);
    
    // Reset saved state when there are unsaved changes
    if (hasChanges && isSaved) {
      setIsSaved(false);
    }
  }, [slides, project.title, project.description, lastSavedProject, initialProject, isSaved]);

  // AUTO-SAVE DISABLED: Manual save only
  // useEffect(() => {
  //   if (isOffline) return;
  //   const interval = window.setInterval(() => {
  //     if (pendingChanges) {
  //       scheduleSave(true);
  //     }
  //   }, 10000);
  //   return () => window.clearInterval(interval);
  // }, [pendingChanges, isOffline, scheduleSave]);

  // AUTO-SAVE DISABLED: Manual save only
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Restore cached slides but don't auto-save
      if (!pendingStorageKey || typeof window === "undefined") return;
      const cached = localStorage.getItem(pendingStorageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.slides) {
            setSlides(parsed.slides);
            clearPendingSlides();
            setHasUnsavedChanges(true); // Mark as unsaved so user can save manually
          }
        } catch (error) {
          console.warn("Unable to restore pending slides", error);
        }
      }
      // AUTO-SAVE REMOVED: scheduleSave(true);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setSaveState("offline");
      cachePendingSlides();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [cachePendingSlides, clearPendingSlides, pendingStorageKey]);

  useEffect(() => {
    const handleKeyDelete = (event) => {
      if (!selectedObject) return;
      const target = event.target;
      const isEditing = target && target.dataset && target.dataset.editable === "true";
      if (isEditing) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteObject(selectedObject.id);
      }
    };

    window.addEventListener("keydown", handleKeyDelete);
    return () => window.removeEventListener("keydown", handleKeyDelete);
  }, [deleteObject, selectedObject]);

  const ToolbarSection = ({ title, children }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] whitespace-nowrap">{title}</span>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );

  const relativeLastSaved = useMemo(() => {
    const now = Date.now();
    const delta = now - lastSavedAt;
    if (!lastSavedAt) return "never";
    if (delta < 5000) return "just now";
    if (delta < 60000) return `${Math.floor(delta / 1000)} seconds ago`;
    if (delta < 3600000) {
      const minutes = Math.floor(delta / 60000);
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    const hours = Math.floor(delta / 3600000);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }, [lastSavedAt]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const currentFontSize = selectedTextObject?.fontSize ?? DEFAULT_TEXT_PROPS.fontSize;
  const currentBold = (selectedTextObject?.fontWeight ?? DEFAULT_TEXT_PROPS.fontWeight) >= 600;
  const currentItalic = selectedTextObject?.italic ?? DEFAULT_TEXT_PROPS.italic;
  const currentUnderline = selectedTextObject?.underline ?? DEFAULT_TEXT_PROPS.underline;
  const currentAlign = selectedTextObject?.align ?? DEFAULT_TEXT_PROPS.align;
  const currentColor = selectedTextObject?.color ?? DEFAULT_TEXT_PROPS.color;
  const currentLineHeight = selectedTextObject?.lineHeight ?? DEFAULT_TEXT_PROPS.lineHeight;

  const addSlideFromTemplate = (templateId) => {
    const [templateSlide] = cloneTemplateSlides(templateId);
    if (!templateSlide) return;
    setSlides((prev) => [...prev, templateSlide]);
    setActiveSlideId(templateSlide.id);
  };

  const addBlankSlide = () => {
    const slide = defaultSlide();
    setSlides((prev) => [...prev, slide]);
    setActiveSlideId(slide.id);
  };

  const deleteSlide = (id) => {
    setSlides((prev) => {
      if (prev.length <= 1) {
        window.alert("Cannot delete the last slide");
        return prev;
      }
      const filtered = prev.filter((slide) => slide.id !== id);
      if (activeSlideId === id) {
        setActiveSlideId(filtered[filtered.length - 1]?.id ?? filtered[0]?.id ?? null);
      }
      return filtered;
    });
  };

  if (!initialProject) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-['Poppins',ui-sans-serif]">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-semibold">Project not found</h1>
          <p className="text-sm text-white/70">
            The project you tried to open is no longer available. Return to the dashboard to create a new deck.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-full bg-white text-[#0F172A] px-5 py-2 text-sm font-semibold shadow-lg hover:opacity-90 transition"
          >
            Back to dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative font-['Poppins',ui-sans-serif] text-[#1E1E1E]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: gradientBackground }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(125% 125% at 0% 0%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 65%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(120% 120% at 100% 100%, rgba(12,124,89,0.38) 0%, rgba(62,109,204,0.18) 35%, rgba(62,109,204,0) 70%)" }}
      />

      <div className="relative z-10 flex h-screen flex-col">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" />
        <input type="file" accept="video/mp4,video/quicktime,video/webm" ref={videoFileInputRef} onChange={handleVideoFileChange} className="hidden" />

        <header className="flex-shrink-0 flex items-center justify-between bg-white/80 px-6 py-3 shadow-[0_2px_8px_rgba(32,64,128,0.1)] backdrop-blur-lg border-b border-white/20">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={async () => {
                if (hasUnsavedChanges) {
                  setPendingNavigation(() => async () => {
                    await publishToProjects();
                    navigate("/projects", { state: { highlightProjectId: project.id || projectId } });
                  });
                  setShowLeaveDialog(true);
                } else {
                  await publishToProjects();
                  navigate("/projects", { state: { highlightProjectId: project.id || projectId } });
                }
              }}
              className="flex items-center gap-2 rounded-full bg-[#3E6DCC]/10 px-4 py-2 text-sm font-medium text-[#3E6DCC] hover:bg-[#3E6DCC]/15 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Projects
            </button>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-1">Project</p>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => setProject((prev) => ({ ...prev, title: e.target.value }))}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    setHasUnsavedChanges(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    } else if (e.key === "Escape") {
                      setProject((prev) => ({ ...prev, title: initialProject?.name || "Untitled project" }));
                      setIsEditingTitle(false);
                      setHasUnsavedChanges(false);
                    }
                  }}
                  className="text-lg font-semibold text-[#1E1E1E] bg-transparent border-b-2 border-[#3E6DCC] focus:outline-none focus:border-[#2853b2] min-w-[200px]"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-lg font-semibold text-[#1E1E1E] cursor-pointer hover:text-[#3E6DCC] transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit project name"
                >
                  {project.title}
                </h1>
              )}
            </div>
          </div>
          <img src={logo} alt="Aramco Digital" className="h-12 md:h-14 w-auto" />
          <div className="flex items-center gap-3">
            {lastSavedProject && (
              <button
                type="button"
                onClick={revertToLastSaved}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  !hasUnsavedChanges
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#6B7280] hover:bg-gray-50 border border-[#D1D5DB]"
                }`}
                title="Revert to last saved draft"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Revert
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await performSave();
              }}
              disabled={isSaving || isOffline || isSaved}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow transition ${
                isSaving || isOffline || isSaved
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#3E6DCC] text-white hover:bg-[#2853b2]"
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save
                </>
              )}
            </button>
            <button
              ref={colorButtonRef}
              type="button"
              onClick={toggleToolbarColorPanel}
              disabled={!hasSelection}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow transition ${
                hasSelection ? "bg-[#3E6DCC] text-white hover:bg-[#2853b2]" : "bg-white text-[#94A3B8] border border-[#D8DEEA] cursor-not-allowed"
              }`}
            >
              Palette
            </button>
            <button
              type="button"
              className="rounded-full border border-[#3E6DCC] bg-white px-4 py-2 text-sm font-semibold text-[#3E6DCC] shadow-sm hover:bg-[#3E6DCC]/10 transition"
            >
              AI Layout (soon)
            </button>
          </div>
        </header>

        {/* Confirmation Dialog */}
        {showLeaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Unsaved Changes</h3>
              <p className="text-sm text-[#6B7280] mb-6">
                You have unsaved changes. What would you like to do?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await performSave();
                    setShowLeaveDialog(false);
                    if (pendingNavigation) {
                      await pendingNavigation();
                      setPendingNavigation(null);
                    }
                  }}
                  disabled={isSaving}
                  className="w-full rounded-full bg-[#3E6DCC] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#2853b2] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save and leave"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowLeaveDialog(false);
                    if (pendingNavigation) {
                      // Publish current state (not saved draft) before leaving
                      await publishToProjects(true);
                      await pendingNavigation();
                      setPendingNavigation(null);
                    }
                  }}
                  className="w-full rounded-full border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm hover:bg-gray-50 transition"
                >
                  Leave without saving
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveDialog(false);
                    setPendingNavigation(null);
                  }}
                  className="w-full rounded-full border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 rounded-none bg-white/75 px-6 py-3 shadow-[0_2px_8px_rgba(32,64,128,0.1)] backdrop-blur flex flex-wrap items-center gap-6 border-b border-white/20">
          <ToolbarSection title="Text">
            <button
              type="button"
              onClick={handleAddTextBox}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Text Box
            </button>
            <button
              type="button"
              onClick={() => handleListToggle("unordered")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
              disabled={!selectedTextObject}
            >
              Bullets
            </button>
            <button
              type="button"
              onClick={() => handleListToggle("ordered")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
              disabled={!selectedTextObject}
            >
              Numbered
            </button>
            <button
              type="button"
              onClick={() => handleHighlightSelection(highlightColor)}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
              disabled={!selectedTextObject}
            >
              Highlight
            </button>
            <input
              type="color"
              value={highlightColor}
              onChange={(event) => handleHighlightSelection(event.target.value)}
              className="h-7 w-7 cursor-pointer rounded-full border border-[#CBD5F0] bg-transparent"
              title="Highlight color"
            />
          </ToolbarSection>

          <ToolbarSection title="Shapes">
            <button
              type="button"
              onClick={() => handleAddShape("rectangle")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Rectangle
            </button>
            <button
              type="button"
              onClick={() => handleAddShape("circle")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Circle
            </button>
            <button
              type="button"
              onClick={() => handleAddShape("triangle")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Triangle
            </button>
            <button
              type="button"
              onClick={() => handleAddShape("arrow")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Arrow
            </button>
          </ToolbarSection>

          <ToolbarSection title="Media">
            <button
              type="button"
              onClick={handleFilePicker}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={handleAddImageFromUrl}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={handleVideoUploadClick}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Video Upload
            </button>
            <button
              type="button"
              onClick={handleEmbedVideoPrompt}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Video URL
            </button>
          </ToolbarSection>

          <ToolbarSection title="Charts">
            <button
              type="button"
              onClick={() => handleAddChart("bar")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Bar
            </button>
            <button
              type="button"
              onClick={() => handleAddChart("line")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => handleAddChart("pie")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Pie
            </button>
            <button
              type="button"
              onClick={() => handleAddChart("table")}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Table
            </button>
          </ToolbarSection>

          <ToolbarSection title="Brand">
            {BRAND_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleApplyBrandColor(color)}
                className="h-7 w-7 rounded-full border border-[#CBD5F0]"
                style={{ background: color }}
                title={`Apply ${color}`}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowGrid((prev) => !prev)}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              {showGrid ? "Hide Grid" : "Show Grid"}
            </button>
            <button
              type="button"
              onClick={() => setSnapEnabled((prev) => !prev)}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              {snapEnabled ? "Disable Snap" : "Enable Snap"}
            </button>
          </ToolbarSection>

          <ToolbarSection title="AI Assistant">
            <button
              type="button"
              onClick={handleAiAssist}
              className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
            >
              Suggest Layout
            </button>
          </ToolbarSection>
        </div>

        <div className="flex flex-1 gap-0 relative overflow-hidden min-h-0">
          {/* Left edge toggle button */}
          <button
            type="button"
            onClick={() => setShowLeftPanel((prev) => !prev)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-1.5 rounded-r-full bg-white/95 hover:bg-white border border-l-0 border-[#3E6DCC]/30 shadow-lg transition-all px-2 py-4 min-h-[80px]"
            title={showLeftPanel ? "Hide slides panel" : "Show slides panel"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3E6DCC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showLeftPanel ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-semibold text-[#3E6DCC] uppercase tracking-wider leading-tight">
                {showLeftPanel ? "Hide" : "Show"}
              </span>
              <span className="text-[9px] font-semibold text-[#3E6DCC] uppercase tracking-wider leading-tight">
                Slides
              </span>
            </div>
          </button>

          {showLeftPanel && (
            <aside className="flex-shrink-0 w-[240px] bg-white/90 border-r border-white/30 backdrop-blur overflow-y-auto space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1E1E1E] uppercase tracking-wide">Slides</h2>
                <button
                  type="button"
                  onClick={addBlankSlide}
                  className="rounded-full bg-[#3E6DCC] text-white text-xs px-3 py-1.5 font-semibold shadow hover:bg-[#2f5cc4]"
                >
                  New
                </button>
              </div>
              <div className="space-y-3">
                {slides.map((slide, index) => {
                  const isActive = slide.id === activeSlideId;
                  return (
                    <div
                      key={slide.id}
                      className={`rounded-2xl border p-3 transition relative ${
                        isActive ? "border-[#3E6DCC] bg-[#F0F4FF]" : "border-transparent bg-white hover:border-[#C5D4F7]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSlideId(slide.id)}
                        className="w-full text-left"
                      >
                        <div className="text-xs uppercase tracking-wide text-[#93A3C3]">Slide {index + 1}</div>
                        <div className="text-sm font-semibold text-[#1E1E1E] max-h-12 overflow-hidden">
                          {slide.title || "Untitled"}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSlide(slide.id)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#6B7280] shadow hover:text-[#EF4444]"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

          <main className="flex-1 flex items-start justify-center min-h-0 overflow-y-auto" onMouseDown={handleCanvasBackgroundClick}>
            <div className="relative w-full h-full flex items-start justify-center py-6 px-4">
              <div
                ref={slideWrapperRef}
                className={`relative bg-white shadow-[0_4px_20px_rgba(15,23,42,0.1)] overflow-hidden transition-opacity duration-200 ease-in-out ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  width: SLIDE_WIDTH,
                  height: SLIDE_HEIGHT,
                  backgroundImage: showGrid
                    ? `linear-gradient(rgba(62,109,204,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(62,109,204,0.08) 1px, transparent 1px)`
                    : undefined,
                  backgroundSize: showGrid ? `${GRID_SIZE * 2}px ${GRID_SIZE * 2}px` : undefined
                }}
              >
                  <div className="absolute inset-0 bg-white" />

                  {activeSlide?.objects.map((obj) => {
                    const isSelected = selectedIds.includes(obj.id);
                    const rotation = obj.rot || 0;
                    const containerStyle = {
                      left: obj.x,
                      top: obj.y,
                      width: obj.w,
                      height: obj.h,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "center",
                      zIndex: obj.zIndex ?? 1
                    };

                    const renderObject = () => {
                      if (obj.type === "text") {
                        return (
                          <div
                            ref={(el) => assignEditableRef(obj.id, el)}
                            contentEditable
                            data-editable="true"
                            suppressContentEditableWarning
                            spellCheck={false}
                            onInput={(event) => handleTextInput(obj.id, event)}
                            onKeyDown={(event) => handleTextKeyDown(obj.id, event)}
                            className="h-full w-full resize-none overflow-auto rounded-2xl bg-transparent p-3 outline-none border border-transparent hover:border-[#DDE6FB]"
                            style={{
                              color: obj.color || DEFAULT_TEXT_PROPS.color,
                              backgroundColor: obj.highlight && obj.highlight !== "transparent" ? obj.highlight : "transparent",
                              fontFamily: obj.fontFamily || "Poppins",
                              fontSize: obj.fontSize || DEFAULT_TEXT_PROPS.fontSize,
                              fontWeight: obj.fontWeight || DEFAULT_TEXT_PROPS.fontWeight,
                              fontStyle: obj.italic ? "italic" : "normal",
                              textDecoration: obj.underline ? "underline" : "none",
                              textAlign: obj.align || DEFAULT_TEXT_PROPS.align,
                              lineHeight: obj.lineHeight || DEFAULT_TEXT_PROPS.lineHeight
                            }}
                            dangerouslySetInnerHTML={{ __html: obj.html ?? obj.text ?? "" }}
                          />
                        );
                      }

                      if (obj.type === "image") {
                        return (
                          <img
                            src={obj.src}
                            alt={obj.alt || "Slide media"}
                            draggable={false}
                            className="h-full w-full object-cover rounded-2xl"
                            style={{ pointerEvents: "none" }}
                          />
                        );
                      }
      if (obj.type === "video") {
        return (
          <VideoPlayer
            object={obj}
            onChange={(updates) => updateObject(obj.id, () => updates)}
            isSelected={isSelected}
          />
        );
      }

                      if (obj.type === "chart") {
                        const accent = obj.accentColor || "#3E6DCC";
                        const background = obj.background || "#FFFFFF";
                        return (
                          <div className="h-full w-full rounded-2xl border border-[#D8DEEA] bg-white p-4" style={{ background }}>
                            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{(obj.chartType || "chart").toUpperCase()}</div>
                            <div className="flex h-[70%] items-end justify-between gap-2">
                              {[40, 70, 55, 90].map((value, index) => (
                                <div key={index} className="flex-1 rounded-full" style={{ background: accent, height: `${value}%`, opacity: 0.6 + index * 0.1 }} />
                              ))}
                            </div>
                          </div>
                        );
                      }

                      const shapeType = obj.shape || obj.type;
                      const fill = obj.fill || "#E6EEFF";
                      const stroke = obj.stroke || "transparent";
                      const strokeWidth = obj.strokeWidth ?? 2;

                      if (shapeType === "circle" || shapeType === "ellipse") {
                        return (
                          <div
                            className="h-full w-full"
                            style={{
                              borderRadius: "50%",
                              background: fill,
                              border: `${strokeWidth}px solid ${stroke}`,
                              opacity: obj.opacity ?? 1
                            }}
                          />
                        );
                      }

                      if (shapeType === "triangle") {
                        return (
                          <div
                            className="h-full w-full"
                            style={{
                              background: fill,
                              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                              opacity: obj.opacity ?? 1
                            }}
                          />
                        );
                      }

                      if (shapeType === "arrow") {
                        return (
                          <div
                            className="h-full w-full"
                            style={{
                              background: fill,
                              clipPath: "polygon(0% 35%, 65% 35%, 65% 15%, 100% 50%, 65% 85%, 65% 65%, 0% 65%)",
                              opacity: obj.opacity ?? 1
                            }}
                          />
                        );
                      }

                      if (shapeType === "line") {
                        return (
                          <div
                            className="absolute top-1/2 left-0"
                            style={{
                              width: "100%",
                              height: obj.strokeWidth || 4,
                              background: stroke || "#1F2937",
                              transform: "translateY(-50%)",
                              borderRadius: 9999
                            }}
                          />
                        );
                      }

                      return (
                        <div
                          className="h-full w-full rounded-2xl"
                          style={{
                            background: fill,
                            border: `${strokeWidth}px solid ${stroke}`,
                            opacity: obj.opacity ?? 1,
                            borderRadius: obj.radius ?? 24
                          }}
                        />
                      );
                    };

                    return (
                      <div
                        key={obj.id}
                        role="presentation"
                        className={`absolute group ${isSelected ? "ring-2 ring-[#3E6DCC] ring-offset-[2px] ring-offset-white rounded-3xl" : ""}`}
                        style={containerStyle}
                        onPointerDown={(event) => handleObjectMouseDown(event, obj)}
                      >
                        {renderObject()}

                        {isSelected &&
                          RESIZE_HANDLES.map((handle) => (
                            <button
                              type="button"
                              key={handle.key}
                              onPointerDown={(event) => handleResizePointerDown(event, obj, handle.key)}
                              className={`absolute h-3 w-3 rounded-full border border-white bg-[#3E6DCC] shadow ${handle.className}`}
                              style={{ cursor: handle.cursor }}
                            />
                          ))}
                      </div>
                    );
                  })}

                  {aiInsights[activeSlide?.id]?.map((issue) => {
                    const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
                    const x = clampValue(issue.x ?? 20, 8, SLIDE_WIDTH - 28);
                    const y = clampValue(issue.y ?? 20, 8, SLIDE_HEIGHT - 28);
                    return (
                      <button
                        type="button"
                        key={issue.id}
                        aria-label="AI suggestion"
                        onClick={() =>
                          setHighlightedIssueId((current) => (current === issue.id ? null : issue.id))
                        }
                        className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-[#FBBF24] text-[11px] text-[#1B1533] shadow pointer-events-auto"
                        style={{ left: x, top: y }}
                      >
                        ⚠️
                        {highlightedIssueId === issue.id && (
                          <div className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-lg bg-[#1B1533] px-3 py-2 text-xs text-white shadow-lg">
                            {issue.message}
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {(!activeSlide || activeSlide.objects.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-base text-[#93A3C3]">
                      Double-click anywhere to add your story. Use templates to accelerate content blocks.
                    </div>
                  )}
                </div>
            </div>
          </main>

          {/* Right edge toggle button */}
          <button
            type="button"
            onClick={() => setShowRightPanel((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-1.5 rounded-l-full bg-white/95 hover:bg-white border border-r-0 border-[#3E6DCC]/30 shadow-lg transition-all px-2 py-4 min-h-[80px]"
            title={showRightPanel ? "Hide sidebar" : "Show sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3E6DCC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showRightPanel ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-semibold text-[#3E6DCC] uppercase tracking-wider leading-tight">
                {showRightPanel ? "Hide" : "Show"}
              </span>
              <span className="text-[9px] font-semibold text-[#3E6DCC] uppercase tracking-wider leading-tight">
                Sidebar
              </span>
            </div>
          </button>

          {showRightPanel && (
            <aside className="flex-shrink-0 w-[280px] bg-white/90 border-l border-white/30 backdrop-blur overflow-y-auto space-y-5 p-5">
              <section>
                <h2 className="text-sm font-semibold text-[#1E1E1E] uppercase tracking-wide mb-3">Selection</h2>
                {selectedObjects.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">Select text or shapes on the canvas to tweak details.</p>
                ) : (
                  <div className="space-y-2 text-sm text-[#1E1E1E]">
                    <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">Selected: {selectedObjects.length}</div>
                    <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">Type: {selectedObjects.length === 1 ? selectedObjects[0].type : "Mixed"}</div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={duplicateObject}
                        className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={bringForward}
                        className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
                      >
                        Bring Forward
                      </button>
                      <button
                        type="button"
                        onClick={sendBackward}
                        className="rounded-full border border-[#CBD5F0] bg-white px-3 py-1 text-xs font-semibold text-[#1E1E1E] hover:bg-[#EEF2FF] transition"
                      >
                        Send Backward
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteSelection}
                        className="rounded-full border border-[#FECACA] bg-[#FFF5F5] px-3 py-1 text-xs font-semibold text-[#B91C1C] hover:bg-[#fee2e2] transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section>
              <h3 className="text-sm font-semibold text-[#1E1E1E] uppercase tracking-wide mb-3">Typography</h3>
              <fieldset disabled={!selectedTextObject} className={`${!selectedTextObject ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <div className="space-y-4 text-sm text-[#1E1E1E]">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs uppercase tracking-wide text-[#93A3C3]">Font Size</label>
                    <input
                      type="number"
                      min={8}
                      max={96}
                      value={Math.round(currentFontSize)}
                      onChange={(event) =>
                        updateSelectedText(() => ({
                          fontSize: Math.min(96, Math.max(8, Number(event.target.value) || DEFAULT_TEXT_PROPS.fontSize))
                        }))
                      }
                      className="w-20 rounded-lg border border-[#D8DEEA] bg-white px-2 py-1 text-right"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSelectedText((obj) => ({ fontWeight: obj.fontWeight >= 600 ? 400 : 700 }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        currentBold ? "border-[#3E6DCC] bg-[#EEF3FF] text-[#1E1E1E]" : "border-[#D8DEEA] bg-white"
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedText((obj) => ({ italic: !obj.italic }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold italic transition ${
                        currentItalic ? "border-[#3E6DCC] bg-[#EEF3FF] text-[#1E1E1E]" : "border-[#D8DEEA] bg-white"
                      }`}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedText((obj) => ({ underline: !obj.underline }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        currentUnderline ? "border-[#3E6DCC] bg-[#EEF3FF] text-[#1E1E1E]" : "border-[#D8DEEA] bg-white"
                      }`}
                    >
                      U
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {[
                      { icon: "L", value: "left" },
                      { icon: "C", value: "center" },
                      { icon: "R", value: "right" },
                      { icon: "J", value: "justify" }
                    ].map(({ icon, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          updateSelectedText(() => ({ align: value }));
                          const commandMap = {
                            left: "justifyLeft",
                            center: "justifyCenter",
                            right: "justifyRight",
                            justify: "justifyFull"
                          };
                          const command = commandMap[value];
                          if (command) {
                            applyTextCommand(command);
                          }
                        }}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          currentAlign === value ? "border-[#3E6DCC] bg-[#EEF3FF]" : "border-[#D8DEEA] bg-white"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wide text-[#93A3C3]">Color</label>
                    <button
                      type="button"
                      ref={inspectorColorRef}
                      onClick={() => openColorPanel(inspectorColorRef.current)}
                      className="mt-2 flex h-9 w-full items-center justify-between rounded-xl border border-[#D8DEEA] bg-white px-3 py-1 text-sm"
                    >
                      <span>{currentColor}</span>
                      <span className="h-5 w-5 rounded-full border border-[#CBD6F3]" style={{ background: currentColor }} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wide text-[#93A3C3]">Line Height ({currentLineHeight.toFixed(2)})</label>
                    <input
                      type="range"
                      min={0.8}
                      max={2}
                      step={0.05}
                      value={currentLineHeight}
                      onChange={(event) => updateSelectedText(() => ({ lineHeight: Number(event.target.value) }))}
                      className="mt-2 w-full accent-[#3E6DCC]"
                    />
                  </div>
                </div>
              </fieldset>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#1E1E1E] uppercase tracking-wide mb-3">AI Suggestions</h3>
              <div className="space-y-2 text-xs text-[#374151]">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm flex flex-col gap-1"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3E6DCC]">
                      {suggestion.category}
                    </span>
                    <span className="flex items-start gap-2 text-[13px] leading-relaxed">
                      <span className="text-base leading-none pt-[2px]">✨</span>
                      {suggestion.message}
                    </span>
                  </div>
                ))}
              </div>
            </section>

              <section className="rounded-2xl border border-dashed border-[#C5D4F7] bg-white/70 px-4 py-3 text-sm text-[#6B7280]">
                Save a layout into your personal template library. Coming soon—we'll unlock customizable template sets.
              </section>
            </aside>
          )}
        </div>
      </div>

      {colorPanel.open && (
        <div
          ref={colorPanelRef}
          className="fixed z-50 w-[228px] rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.25)]"
          style={{ top: colorPanel.top, left: colorPanel.left }}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Presets</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Apply color ${color}`}
                onClick={() => handleSwatchClick(color)}
                className="h-8 w-8 rounded-full border border-[#E2E8F0] transition hover:scale-105"
                style={{ background: color }}
              />
            ))}
          </div>

          {recentColors.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Recent</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {recentColors.map((color) => (
                  <button
                    key={`recent-${color}`}
                    type="button"
                    aria-label={`Apply recent color ${color}`}
                    onClick={() => handleSwatchClick(color)}
                    className="h-8 w-8 rounded-full border border-[#E2E8F0] transition hover:scale-105"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Custom</label>
            <input
              type="color"
              className="mt-2 h-10 w-full cursor-pointer rounded-2xl border border-[#E2E8F0] bg-white"
              onChange={handleCustomColorChange}
              disabled={!hasSelection}
            />
          </div>
        </div>
      )}
    </section>
  );
}
