import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { cloneTemplateSlides, slideTemplates } from "../templates/brandTemplates";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

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
  "radial-gradient(115% 115% at 50% 50%, #E6EEFF 0%, #93B9FF 55%, #3E6DCC 100%)";

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
  const { projects, updateProject } = useProjects();

  const project = useMemo(() => projects.find((item) => item.id === projectId), [projects, projectId]);

  const [slides, setSlides] = useState(() => project?.slides ?? [defaultSlide()]);
  const [activeSlideId, setActiveSlideId] = useState(() => slides[0]?.id);
  const [selectedIds, setSelectedIds] = useState([]);
  const [colorPanel, setColorPanel] = useState({
    open: false,
    top: 0,
    left: 0
  });
  const [recentColors, setRecentColors] = useState([]);
  const [statusText, setStatusText] = useState("All changes saved");
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
  const interactionRef = useRef(interaction);

  useEffect(() => {
    interactionRef.current = interaction;
  }, [interaction]);

  useEffect(() => {
    if (!project) return;
    const nextSlides = project.slides && project.slides.length > 0 ? project.slides : [defaultSlide()];
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0]?.id);
  }, [project]);

  const activeSlide = useMemo(
    () => slides.find((slide) => slide.id === activeSlideId) ?? slides[0],
    [slides, activeSlideId]
  );

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
      setStatusText("Saving…");
    },
    [activeSlide, computeNextZIndex, replaceObjectsForSlide]
  );

  const deleteObject = useCallback(
    (objectId) => {
      if (!objectId || !activeSlide) return;
      replaceObjectsForSlide(activeSlide.id, (objects) => objects.filter((object) => object.id !== objectId));
      setSelectedIds([]);
      setStatusText("Saving…");
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
    setStatusText("AI assistant (coming soon)");
  };

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

  const currentFontSize = selectedTextObject?.fontSize ?? DEFAULT_TEXT_PROPS.fontSize;
  const currentBold = (selectedTextObject?.fontWeight ?? DEFAULT_TEXT_PROPS.fontWeight) >= 600;
  const currentItalic = selectedTextObject?.italic ?? DEFAULT_TEXT_PROPS.italic;
  const currentUnderline = selectedTextObject?.underline ?? DEFAULT_TEXT_PROPS.underline;
  const currentAlign = selectedTextObject?.align ?? DEFAULT_TEXT_PROPS.align;
  const currentColor = selectedTextObject?.color ?? DEFAULT_TEXT_PROPS.color;
  const currentLineHeight = selectedTextObject?.lineHeight ?? DEFAULT_TEXT_PROPS.lineHeight;

  useEffect(() => {
    if (!project) return;
    setStatusText("Saving…");
    const timeout = setTimeout(() => {
      updateProject(project.id, { slides });
      setStatusText("All changes saved");
    }, 600);
    return () => clearTimeout(timeout);
  }, [slides, project, updateProject]);

  const addSlideFromTemplate = (templateId) => {
    const [templateSlide] = cloneTemplateSlides(templateId);
    if (!templateSlide) return;
    setSlides((prev) => [...prev, templateSlide]);
    setActiveSlideId(templateSlide.id);
    setStatusText("Saving…");
  };

  const addBlankSlide = () => {
    const slide = defaultSlide();
    setSlides((prev) => [...prev, slide]);
    setActiveSlideId(slide.id);
  };

  const deleteSlide = (id) => {
    setSlides((prev) => {
      if (prev.length <= 1) {
        setStatusText("Cannot delete the last slide");
        return prev;
      }
      const filtered = prev.filter((slide) => slide.id !== id);
      if (activeSlideId === id) {
        setActiveSlideId(filtered[filtered.length - 1]?.id ?? filtered[0]?.id ?? null);
      }
      setStatusText("Saving…");
      return filtered;
    });
  };

  if (!project) {
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
        style={{ background: "radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(120% 120% at 100% 100%, rgba(9,30,66,0.4) 0%, rgba(9,30,66,0) 65%)" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-8 py-8 gap-6">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" />

        <header className="flex items-center justify-between rounded-3xl bg-white/80 px-6 py-4 shadow-[0_18px_45px_rgba(32,64,128,0.18)] backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/projects", { state: { highlightProjectId: project.id } })}
              className="flex items-center gap-2 rounded-full bg-[#3E6DCC]/10 px-4 py-2 text-sm font-medium text-[#3E6DCC] hover:bg-[#3E6DCC]/15 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Projects
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#6B7280]">Project</p>
              <h1 className="text-lg font-semibold text-[#1E1E1E]">{project.name}</h1>
            </div>
          </div>
          <img src={logo} alt="Aramco Digital" className="h-12 md:h-14 w-auto" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280]">{statusText}</span>
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

        <div className="rounded-3xl bg-white/75 px-6 py-4 shadow-[0_16px_36px_rgba(32,64,128,0.16)] backdrop-blur flex flex-wrap items-center gap-6">
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

        <div className="flex flex-1 gap-6">
          <aside className="w-[240px] rounded-3xl bg-white/85 p-4 shadow-[0_18px_40px_rgba(32,64,128,0.14)] backdrop-blur space-y-4">
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

          <main className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[1040px]" onMouseDown={handleCanvasBackgroundClick}>
              <div className="relative mx-auto rounded-[40px] border border-white/40 bg-[#FAFBFF]/90 shadow-[0_32px_60px_rgba(23,48,107,0.22)] p-6">
                <div
                  ref={slideWrapperRef}
                  className="relative mx-auto bg-white rounded-[32px] shadow-[0_20px_48px_rgba(15,23,42,0.18)] overflow-hidden"
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

                  {(!activeSlide || activeSlide.objects.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-base text-[#93A3C3]">
                      Double-click anywhere to add your story. Use templates to accelerate content blocks.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          <aside className="w-[280px] rounded-3xl bg-white/85 p-5 shadow-[0_18px_40px_rgba(32,64,128,0.14)] backdrop-blur space-y-5">
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
              <h3 className="text-sm font-semibold text-[#1E1E1E] uppercase tracking-wide mb-3">Templates</h3>
              <div className="grid gap-3">
                {slideTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => addSlideFromTemplate(template.id)}
                    className="w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-left shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-14 w-20 rounded-xl border border-[#E2E8F8] bg-white shadow-inner"
                        style={{
                          background:
                            template.previewAccent === "#FFFFFF"
                              ? "linear-gradient(135deg, #FFFFFF 0%, #E6EEFF 100%)"
                              : `linear-gradient(135deg, ${template.previewAccent} 0%, rgba(230,238,255,0.65) 100%)`
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1E1E1E]">{template.name}</p>
                        <p className="text-xs text-[#6B7280]">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-dashed border-[#C5D4F7] bg-white/70 px-4 py-3 text-sm text-[#6B7280]">
              Save a layout into your personal template library. Coming soon—we’ll unlock customizable template sets.
            </section>
          </aside>
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
