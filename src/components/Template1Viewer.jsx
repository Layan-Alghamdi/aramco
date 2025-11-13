import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BASE_HEIGHT, BASE_WIDTH, template1Slides } from "@/templates/template1Slides";

const STORAGE_KEY = "template1-design";

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

const formatText = (text = "") => text.replace(/\r/g, "").split("\n");

export default function Template1Viewer({ isOpen, onClose }) {
  const [design, setDesign] = useState(() => createDefaultState());
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState("fit");
  const [scale, setScale] = useState(1);

  const viewportRef = useRef(null);
  const scaledWrapperRef = useRef(null);

  const currentSlide = template1Slides[activeSlideIndex];
  const currentState = design[currentSlide.id] ?? createDefaultState()[currentSlide.id];

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDesign(mergeWithDefaults(JSON.parse(raw)));
      } else {
        setDesign(createDefaultState());
      }
    } catch {
      setDesign(createDefaultState());
    }
  }, [isOpen]);

  const recalcScale = useCallback(() => {
    if (!isOpen || !viewportRef.current) return;
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

  const thumbnails = useMemo(() => template1Slides.map((slide) => slide.referenceImage ?? null), []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#0F172A] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Template 1 Viewer"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Template 1</h2>
          <span className="text-sm text-white/60">
            Slide {activeSlideIndex + 1} of {template1Slides.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={zoomLevel}
            onChange={(event) => setZoomLevel(event.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            <option value="fit">Fit</option>
            <option value="100">100%</option>
            <option value="150">150%</option>
          </select>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Close viewer"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r border-white/10 bg-[#1E293B] overflow-y-auto p-4">
          <div className="space-y-2">
            {template1Slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlideIndex(index)}
                className={`w-full aspect-video rounded-lg border-2 overflow-hidden transition ${
                  index === activeSlideIndex ? "border-[#3E6DCC] ring-2 ring-[#3E6DCC]/30" : "border-white/20 hover:border-white/40"
                }`}
              >
                {thumbnails[index] ? (
                  <img src={thumbnails[index]} alt={slide.name} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-xs font-medium"
                    style={{ background: slide.background ?? "#002B49" }}
                  >
                    <span>{index + 1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div ref={viewportRef} className="flex flex-1 items-center justify-center overflow-auto bg-[#0F172A] p-8">
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
              className="relative overflow-hidden rounded-3xl shadow-[0_12px_24px_rgba(15,23,42,0.2)]"
              style={{ width: BASE_WIDTH, height: BASE_HEIGHT, background: currentSlide.background ?? "#002B49" }}
            >
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
                const lines = formatText(value);
                return (
                  <div
                    key={layer.key}
                    className="absolute whitespace-pre-wrap"
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
                      textAlign: layer.style.align
                    }}
                  >
                    {lines.map((line, idx) => (
                      <div key={idx}>{line || "\u00a0"}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <button
          onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
          disabled={activeSlideIndex === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          {template1Slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlideIndex(index)}
              className={`h-2 rounded-full transition ${
                activeSlideIndex === index ? "w-8 bg-[#3E6DCC]" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, template1Slides.length - 1))}
          disabled={activeSlideIndex === template1Slides.length - 1}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

