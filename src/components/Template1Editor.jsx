import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";
import { BASE_HEIGHT, BASE_WIDTH, template1Slides } from "@/templates/template1Slides";

const STORAGE_KEY = "template1-design";
const imageCache = new Map();

const createDefaultState = () => {
  return template1Slides.reduce((acc, slide) => {
    acc[slide.id] = {
      layers: slide.layers.reduce((layerAcc, layer) => {
        layerAcc[layer.key] = layer.defaultValue;
        return layerAcc;
      }, {}),
      logoUrl: slide.logo?.defaultValue ?? null
    };
    return acc;
  }, {});
};

const mergeWithDefaults = (saved) => {
  const defaults = createDefaultState();
  if (!saved) return defaults;
  const merged = { ...defaults };
  for (const slide of template1Slides) {
    if (saved[slide.id]) {
      merged[slide.id] = {
        layers: {
          ...defaults[slide.id].layers,
          ...saved[slide.id].layers
        },
        logoUrl: saved[slide.id].logoUrl ?? defaults[slide.id].logoUrl
      };
    }
  }
  return merged;
};

const formatTextForDisplay = (value = "") =>
  value.replace(/\u00a0/g, " ").replace(/\n/g, "<br />");

const sanitizeInput = (value = "") => value.replace(/\r/g, "");

const pxToInches = (valuePx, axis = "x") => {
  if (axis === "y") {
    return (valuePx / BASE_HEIGHT) * 5.625; // 5.625 inches tall for 16:9 layout
  }
  return (valuePx / BASE_WIDTH) * 10; // 10 inches wide
};

const useBackgrounds = () => {
  const [backgrounds, setBackgrounds] = useState({});

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const entries = await Promise.all(
        template1Slides.map(
          (slide) =>
            new Promise((resolve) => {
              if (!slide.backgroundImage) {
                resolve([slide.id, null]);
                return;
              }
              const img = new Image();
              img.onload = () => resolve([slide.id, slide.backgroundImage]);
              img.onerror = () => resolve([slide.id, null]);
              img.src = slide.backgroundImage;
            })
        )
      );
      if (!isMounted) return;
      const map = entries.reduce((acc, [id, src]) => {
        if (src) acc[id] = src;
        return acc;
      }, {});
      setBackgrounds(map);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return backgrounds;
};

async function getImageAsBase64(url) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (imageCache.has(url)) return imageCache.get(url);
  const response = await fetch(url);
  const blob = await response.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  imageCache.set(url, base64);
  return base64;
}

export default function Template1Editor({ isOpen, onClose }) {
  const [design, setDesign] = useState(() => createDefaultState());
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState({ pptx: false, png: false, pdf: false });
  const [zoomLevel, setZoomLevel] = useState("fit");
  const [scale, setScale] = useState(1);
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  const autoSaveTimer = useRef(null);
  const hasLoadedRef = useRef(false);
  const previewRef = useRef(null);
  const scaledWrapperRef = useRef(null);
  const viewportRef = useRef(null);

  const backgrounds = useBackgrounds();

  const currentSlide = template1Slides[activeSlideIndex];
  const currentState = design[currentSlide.id] ?? { layers: {}, logoUrl: null };

  // Load saved design when editor first opens
  useEffect(() => {
    if (!isOpen) return;
    if (hasLoadedRef.current) return;
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        setDesign(mergeWithDefaults(saved));
      } else {
        setDesign(createDefaultState());
      }
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to parse saved Template 1 design", error);
      setDesign(createDefaultState());
    }
  }, [isOpen]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isOpen) return;
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
        setAutoSavedAt(new Date());
      } catch (error) {
        console.error("Failed to persist Template 1 design", error);
      }
    }, 600);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [design, isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        setActiveSlideIndex((prev) => Math.min(prev + 1, template1Slides.length - 1));
      } else if (event.key === "ArrowLeft") {
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Zoom handling
  const recalcScale = useCallback(() => {
    if (!isOpen) return;
    if (!viewportRef.current) return;
    if (zoomLevel === "fit") {
      const availableWidth = viewportRef.current.clientWidth - 48;
      if (availableWidth <= 0) {
        setScale(1);
        return;
      }
      const fitScale = availableWidth / BASE_WIDTH;
      setScale(Math.max(0.2, Math.min(fitScale, 2)));
    } else if (zoomLevel === "100") {
      setScale(1);
    } else if (zoomLevel === "150") {
      setScale(1.5);
    }
  }, [isOpen, zoomLevel]);

  useEffect(() => {
    recalcScale();
  }, [recalcScale]);

  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => recalcScale();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, recalcScale]);

  const setMessageWithTimeout = (text, isError = false) => {
    setMessage(text);
    if (!isError) {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateLayer = (slideId, layerKey, value) => {
    setDesign((prev) => ({
      ...prev,
      [slideId]: {
        ...prev[slideId],
        layers: {
          ...prev[slideId]?.layers,
          [layerKey]: sanitizeInput(value)
        }
      }
    }));
  };

  const handleInlineInput = (slideId, layerKey) => (event) => {
    updateLayer(slideId, layerKey, event.currentTarget.innerText.replace(/\u00a0/g, " "));
  };

  const handleFieldChange = (slideId, layerKey) => (event) => {
    updateLayer(slideId, layerKey, event.target.value);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessageWithTimeout("Please select an image file.", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = typeof e.target?.result === "string" ? e.target.result : null;
      if (!result) {
        setMessageWithTimeout("Failed to load logo image.", true);
        return;
      }
      setDesign((prev) => ({
        ...prev,
        [currentSlide.id]: {
          ...prev[currentSlide.id],
          logoUrl: result
        }
      }));
      setMessageWithTimeout("Logo updated successfully.");
    };
    reader.onerror = () => setMessageWithTimeout("Failed to load logo image.", true);
    reader.readAsDataURL(file);
  };

  const handleResetSlide = () => {
    setDesign((prev) => ({
      ...prev,
      [currentSlide.id]: createDefaultState()[currentSlide.id]
    }));
    setMessageWithTimeout("Slide reset to template.");
  };

  const handleApply = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
      setMessageWithTimeout("Changes saved successfully.");
    } catch (error) {
      console.error("Failed to save Template 1 design", error);
      setMessage("Failed to save changes.");
    }
  };

  const handleExportPng = async () => {
    if (!previewRef.current) return;
    setExporting((prev) => ({ ...prev, png: true }));
    try {
      const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${currentSlide.id}.png`;
      link.href = dataUrl;
      link.click();
      setMessageWithTimeout("PNG exported successfully.");
    } catch (error) {
      console.error("PNG export error", error);
      setMessage("Failed to export PNG.");
    } finally {
      setExporting((prev) => ({ ...prev, png: false }));
    }
  };

  const handleExportPdf = async () => {
    if (!previewRef.current) return;
    setExporting((prev) => ({ ...prev, pdf: true }));
    try {
      const dataUrl = await toJpeg(previewRef.current, { quality: 1, pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: [16, 9] });
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          pdf.addImage(img, "JPEG", 0, 0, 16, 9);
          resolve();
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
      pdf.save(`${currentSlide.id}.pdf`);
      setMessageWithTimeout("PDF exported successfully.");
    } catch (error) {
      console.error("PDF export error", error);
      setMessage("Failed to export PDF.");
    } finally {
      setExporting((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handleExportPptx = async () => {
    setExporting((prev) => ({ ...prev, pptx: true }));
    try {
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      pptx.defineLayout({ name: "LAYOUT_16x9", width: 10, height: 5.625 });

      for (const slideDef of template1Slides) {
        const slideState = design[slideDef.id] ?? createDefaultState()[slideDef.id];
        const slide = pptx.addSlide();

        // Background
        if (backgrounds[slideDef.id]) {
          try {
            const bgData = await getImageAsBase64(backgrounds[slideDef.id]);
            if (bgData) {
              slide.addImage({ data: bgData, x: 0, y: 0, w: 10, h: 5.625 });
            }
          } catch (error) {
            console.warn("Could not embed background for", slideDef.id, error);
          }
        } else {
          slide.background = { color: "FFFFFF" };
        }

        // Logo
        if (slideDef.logo) {
          const logoUrl = slideState.logoUrl ?? slideDef.logo.defaultValue;
          if (logoUrl) {
            try {
              const logoData = await getImageAsBase64(logoUrl);
              if (logoData) {
                slide.addImage({
                  data: logoData,
                  x: pxToInches(slideDef.logo.position.left),
                  y: pxToInches(slideDef.logo.position.top, "y"),
                  w: pxToInches(slideDef.logo.position.width),
                  h: pxToInches(slideDef.logo.position.height, "y")
                });
              }
            } catch (error) {
              console.warn("Could not embed logo for", slideDef.id, error);
            }
          }
        }

        // Text layers
        slideDef.layers.forEach((layer) => {
          const textValue = slideState.layers[layer.key] ?? layer.defaultValue;
          slide.addText(textValue, {
            x: pxToInches(layer.style.left),
            y: pxToInches(layer.style.top, "y"),
            w: pxToInches(layer.style.width),
            h: pxToInches(layer.style.height, "y"),
            fontFace: "Arial",
            fontSize: layer.style.fontSize,
            bold: (layer.style.fontWeight ?? 400) >= 700,
            color: (layer.style.color ?? "#111111").replace("#", ""),
            align: (layer.style.align ?? "left").toUpperCase(),
            valign: "top"
          });
        });
      }

      await pptx.writeFile({ fileName: "Template1-Edited.pptx" });
      setMessageWithTimeout("PPTX exported successfully!");
    } catch (error) {
      console.error("PPTX export error", error);
      setMessage("Failed to export PPTX.");
    } finally {
      setExporting((prev) => ({ ...prev, pptx: false }));
    }
  };

  const thumbnails = useMemo(() => template1Slides.map((slide) => backgrounds[slide.id] ?? null), [backgrounds]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex w-full max-w-[1280px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_32px_68px_rgba(15,23,42,0.28)]"
        style={{ maxHeight: "95vh" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5ECFF] px-8 py-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1E1E1E]">Template 1 • Exact slide editor</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Layout is locked to the PPTX. Click text on the canvas to edit in place. Auto-saves every few seconds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#475569]">
              Zoom
              <select
                value={zoomLevel}
                onChange={(event) => setZoomLevel(event.target.value)}
                className="ml-2 rounded-full border border-[#CBD5F5] bg-white px-3 py-1 text-sm text-[#1E1E1E] shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none"
              >
                <option value="fit">Fit</option>
                <option value="100">100%</option>
                <option value="150">150%</option>
              </select>
            </label>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-[#1E1E1E] text-xl font-semibold leading-none hover:bg-[#E2E8FF] transition"
              aria-label="Close editor"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Thumbnails */}
          <aside className="w-48 border-r border-[#E5ECFF] bg-[#F8FAFC] p-4 overflow-y-auto">
            <div className="space-y-3">
              {template1Slides.map((slide, index) => {
                const isActive = index === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(index)}
                    className={`relative w-full overflow-hidden rounded-2xl border-2 text-left transition ${
                      isActive
                        ? "border-[#3E6DCC] ring-2 ring-[#3E6DCC]/40 shadow-lg"
                        : "border-transparent hover:border-[#3E6DCC]/40"
                    }`}
                    aria-label={`Go to ${slide.name}`}
                  >
                    <div className="aspect-video w-full bg-white">
                      {thumbnails[index] ? (
                        <img src={thumbnails[index]} alt={slide.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#64748B]">Preview</div>
                      )}
                    </div>
                    <div className="px-2 py-1 text-xs font-medium text-[#0F172A]">Slide {index + 1}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-[11px] text-[#6B7280]">
              {autoSavedAt ? `Auto-saved ${autoSavedAt.toLocaleTimeString()}` : "Auto-save ready"}
            </div>
          </aside>

          {/* Preview + inspector */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5ECFF] px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">{currentSlide.name}</p>
                <p className="text-xs text-[#6B7280]">Slide {activeSlideIndex + 1} of {template1Slides.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={activeSlideIndex === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-[#CBD5F5] bg-white px-4 py-1.5 text-sm font-medium text-[#1E1E1E] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, template1Slides.length - 1))}
                  disabled={activeSlideIndex === template1Slides.length - 1}
                  className="inline-flex items-center gap-2 rounded-full border border-[#CBD5F5] bg-white px-4 py-1.5 text-sm font-medium text-[#1E1E1E] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div ref={viewportRef} className="flex flex-1 items-center justify-center overflow-auto bg-[#F8FAFC] p-6">
                <div
                  ref={scaledWrapperRef}
                  style={{
                    width: BASE_WIDTH * scale,
                    height: BASE_HEIGHT * scale,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left"
                  }}
                >
                  <div
                    ref={previewRef}
                    className="relative overflow-hidden rounded-3xl shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
                    style={{ width: BASE_WIDTH, height: BASE_HEIGHT, backgroundColor: "#FFFFFF" }}
                  >
                    {backgrounds[currentSlide.id] ? (
                      <img
                        src={backgrounds[currentSlide.id]}
                        alt="Slide background"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null}

                    {currentSlide.logo && (currentState.logoUrl ?? currentSlide.logo.defaultValue) ? (
                      <div
                        className="absolute"
                        style={{
                          left: currentSlide.logo.position.left,
                          top: currentSlide.logo.position.top,
                          width: currentSlide.logo.position.width,
                          height: currentSlide.logo.position.height
                        }}
                      >
                        <img
                          src={currentState.logoUrl ?? currentSlide.logo.defaultValue}
                          alt="Slide logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : null}

                    {currentSlide.layers.map((layer) => {
                      const value = currentState.layers?.[layer.key] ?? layer.defaultValue;
                      return (
                        <div
                          key={layer.key}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={handleInlineInput(currentSlide.id, layer.key)}
                          className="absolute cursor-text whitespace-pre-wrap focus:outline-none"
                          style={{
                            left: layer.style.left,
                            top: layer.style.top,
                            width: layer.style.width,
                            height: layer.style.height,
                            color: layer.style.color,
                            fontWeight: layer.style.fontWeight,
                            fontFamily: layer.style.fontFamily,
                            fontSize: layer.style.fontSize,
                            lineHeight: layer.style.lineHeight,
                            letterSpacing: layer.style.letterSpacing,
                            textAlign: layer.style.align,
                            display: "flex",
                            alignItems: layer.style.align === "center" ? "center" : "flex-start"
                          }}
                          dangerouslySetInnerHTML={{ __html: formatTextForDisplay(value) }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <aside className="w-[360px] border-l border-[#E5ECFF] bg-white p-6 overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1E1E1E]">Fields</h3>
                    <button
                      type="button"
                      onClick={handleResetSlide}
                      className="text-xs font-semibold text-[#3E6DCC] underline underline-offset-2"
                    >
                      Reset to template
                    </button>
                  </div>

                  {currentSlide.layers.map((layer) => {
                    const value = currentState.layers?.[layer.key] ?? layer.defaultValue;
                    const isMultiline = value.includes("\n");
                    return (
                      <div key={layer.key}>
                        <label className="block text-xs font-medium text-[#475569] mb-2">{layer.label}</label>
                        {isMultiline ? (
                          <textarea
                            rows={Math.min(6, Math.max(3, value.split("\n").length))}
                            value={value}
                            onChange={handleFieldChange(currentSlide.id, layer.key)}
                            className="w-full rounded-2xl border border-[#CBD5F5] bg-white px-4 py-2 text-sm shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={handleFieldChange(currentSlide.id, layer.key)}
                            className="w-full rounded-2xl border border-[#CBD5F5] bg-white px-4 py-2 text-sm shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                          />
                        )}
                      </div>
                    );
                  })}

                  {currentSlide.logo ? (
                    <div>
                      <label className="block text-xs font-medium text-[#475569] mb-2">Replace logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="block w-full text-sm text-[#6B7280] file:mr-4 file:rounded-full file:border-0 file:bg-[#EEF2FF] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#3E6DCC] hover:file:bg-[#E2E8FF] file:transition"
                      />
                    </div>
                  ) : null}

                  {message && (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        message.toLowerCase().includes("fail")
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-[#C9E2FF] bg-[#E9F4FF] text-[#0C4A6E]"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleApply}
                      className="rounded-full bg-[#3E6DCC] px-6 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(62,109,204,0.35)] hover:shadow-[0_18px_30px_rgba(62,109,204,0.45)] transition"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPptx}
                      disabled={exporting.pptx}
                      className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-white transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {exporting.pptx ? "Exporting…" : "Export PPTX"}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      disabled={exporting.pdf}
                      className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-white transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {exporting.pdf ? "Exporting…" : "Export PDF"}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPng}
                      disabled={exporting.png}
                      className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-white transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {exporting.png ? "Exporting…" : "Export PNG"}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

