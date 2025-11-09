import React, { useEffect, useMemo, useRef, useState } from "react";

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

const PRESET_COLORS = [
  "#0D9488",
  "#2563EB",
  "#3C76C9",
  "#22C55E",
  "#64748B",
  "#111827",
  "#E5E7EB",
  "#FFFFFF",
];

const DEFAULT_TEXT_PROPS = {
  fontSize: 32,
  fontWeight: 400,
  italic: false,
  underline: false,
  align: "left",
  color: "#111827",
  lineHeight: 1.2,
};

const INITIAL_SLIDES = [
  {
    id: 1,
    title: "Slide 1",
    objects: [
      {
        id: "obj-1",
        type: "text",
        x: 240,
        y: 150,
        w: 480,
        h: 140,
        rot: 0,
        text: "Presentation Title",
        fontFamily: "Inter",
        ...DEFAULT_TEXT_PROPS,
      },
      {
        id: "obj-2",
        type: "rect",
        x: 240,
        y: 320,
        w: 220,
        h: 120,
        rot: 0,
        fill: "#EEF2FF",
        stroke: "#4338CA",
        strokeWidth: 2,
        opacity: 1,
      },
    ],
  },
];

const gradientBackground =
  "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)";

export default function Editor() {
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  const [activeSlideId, setActiveSlideId] = useState(INITIAL_SLIDES[0].id);
  const [selectedIds, setSelectedIds] = useState([]);
  const [colorPanel, setColorPanel] = useState({
    open: false,
    top: 0,
    left: 0,
  });
  const [recentColors, setRecentColors] = useState([]);

  const colorButtonRef = useRef(null);
  const inspectorColorRef = useRef(null);
  const colorPanelRef = useRef(null);

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

    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== activeSlideId) return slide;
        return {
          ...slide,
          objects: slide.objects.map((obj) => {
            if (!selectedIds.includes(obj.id)) return obj;

            if (obj.type === "text") {
              return { ...obj, color };
            }

            if (obj.type === "rect" || obj.type === "ellipse" || obj.type === "triangle") {
              return { ...obj, fill: color };
            }

            if (obj.type === "line" || obj.type === "arrow") {
              return { ...obj, stroke: color };
            }

            return obj;
          }),
        };
      })
    );

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
  };

  const handleObjectMouseDown = (event, objectId) => {
    event.stopPropagation();
    setSelectedIds([objectId]);
  };

  const updateSelectedText = (updater) => {
    if (!selectedTextObject) return;

    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== activeSlideId) return slide;
        return {
          ...slide,
          objects: slide.objects.map((obj) =>
            obj.id === selectedTextObject.id ? { ...obj, ...updater(obj) } : obj
          ),
        };
      })
    );
  };

  const handleTextInput = (objectId, event) => {
    const value = event.currentTarget.innerText;
    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== activeSlideId) return slide;
        return {
          ...slide,
          objects: slide.objects.map((obj) =>
            obj.id === objectId ? { ...obj, text: value } : obj
          ),
        };
      })
    );
  };

  const handleTextKeyDown = (objectId, event) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modifierHeld = isMac ? event.metaKey : event.ctrlKey;

    if (!modifierHeld) return;

    if (["b", "i", "u", "B", "I", "U"].includes(event.key)) {
      event.preventDefault();
      setSlides((prev) =>
        prev.map((slide) => {
          if (slide.id !== activeSlideId) return slide;
          return {
            ...slide,
            objects: slide.objects.map((obj) => {
              if (obj.id !== objectId) return obj;
              if (event.key.toLowerCase() === "b") {
                const weight = obj.fontWeight === 700 ? 400 : 700;
                return { ...obj, fontWeight: weight };
              }
              if (event.key.toLowerCase() === "i") {
                return { ...obj, italic: !obj.italic };
              }
              if (event.key.toLowerCase() === "u") {
                return { ...obj, underline: !obj.underline };
              }
              return obj;
            }),
          };
        })
      );
    }
  };

  const currentFontSize = selectedTextObject?.fontSize ?? DEFAULT_TEXT_PROPS.fontSize;
  const currentBold = (selectedTextObject?.fontWeight ?? DEFAULT_TEXT_PROPS.fontWeight) >= 600;
  const currentItalic = selectedTextObject?.italic ?? DEFAULT_TEXT_PROPS.italic;
  const currentUnderline = selectedTextObject?.underline ?? DEFAULT_TEXT_PROPS.underline;
  const currentAlign = selectedTextObject?.align ?? DEFAULT_TEXT_PROPS.align;
  const currentColor = selectedTextObject?.color ?? DEFAULT_TEXT_PROPS.color;
  const currentLineHeight = selectedTextObject?.lineHeight ?? DEFAULT_TEXT_PROPS.lineHeight;

  return (
    <section className="min-h-screen relative font-[Inter,ui-sans-serif]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: gradientBackground }} />

      <div className="relative z-10 flex min-h-screen flex-col px-8 py-10 gap-6">
        <div className="flex items-center justify-between rounded-3xl bg-white/75 px-6 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              ref={colorButtonRef}
              type="button"
              onClick={toggleToolbarColorPanel}
              disabled={!hasSelection}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow transition ${
                hasSelection
                  ? "bg-[#1B1533] text-white hover:opacity-90"
                  : "bg-[#CBD0D9] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              Color
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-6">
          <aside className="w-[220px] rounded-3xl bg-white/80 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur">
            <h2 className="text-sm font-semibold text-[#475569] uppercase tracking-wide mb-3">
              Slides
            </h2>
            <div className="space-y-3">
              {slides.map((slide, index) => {
                const isActive = slide.id === activeSlideId;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlideId(slide.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-[#1B1533] bg-[#EEF2FF] text-[#1B1533]"
                        : "border-transparent bg-white text-[#475569] hover:border-[#CBD0D9]"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide text-[#94A3B8]">
                      Slide {index + 1}
                    </div>
                    <div className="text-sm font-semibold">{slide.title}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[960px]" onMouseDown={handleCanvasBackgroundClick}>
              <div className="relative mx-auto" style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}>
                <div className="absolute inset-0 rounded-[32px] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.2)]" />

                {activeSlide?.objects.map((obj) => {
                  const isSelected = selectedIds.includes(obj.id);
                  const baseStyle = {
                    position: "absolute",
                    left: obj.x,
                    top: obj.y,
                    width: obj.w,
                    height: obj.h,
                    transform: `rotate(${obj.rot || 0}deg)`,
                    transformOrigin: "center",
                    cursor: "pointer",
                  };

                  return (
                    <div
                      key={obj.id}
                      role="button"
                      tabIndex={0}
                      onMouseDown={(event) => handleObjectMouseDown(event, obj.id)}
                      className={`group ${
                        isSelected ? "ring-2 ring-[#4338CA] ring-offset-[3px]" : ""
                      }`}
                      style={baseStyle}
                    >
                      {obj.type === "text" && (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(event) => handleTextInput(obj.id, event)}
                          onKeyDown={(event) => handleTextKeyDown(obj.id, event)}
                          className="h-full w-full resize-none overflow-hidden rounded-2xl bg-transparent p-2 text-center outline-none"
                          style={{
                            color: obj.color || DEFAULT_TEXT_PROPS.color,
                            fontFamily: obj.fontFamily || "Inter",
                            fontSize: obj.fontSize || DEFAULT_TEXT_PROPS.fontSize,
                            fontWeight: obj.fontWeight || DEFAULT_TEXT_PROPS.fontWeight,
                            fontStyle: obj.italic ? "italic" : "normal",
                            textDecoration: obj.underline ? "underline" : "none",
                            textAlign: obj.align || DEFAULT_TEXT_PROPS.align,
                            lineHeight: obj.lineHeight || DEFAULT_TEXT_PROPS.lineHeight,
                          }}
                        >
                          {obj.text || "Double-click to edit"}
                        </div>
                      )}

                      {obj.type === "rect" && (
                        <div
                          className="h-full w-full rounded-2xl"
                          style={{
                            background: obj.fill || "#E5E7EB",
                            border: `${obj.strokeWidth || 2}px solid ${obj.stroke || "transparent"}`,
                            opacity: obj.opacity ?? 1,
                          }}
                        />
                      )}

                      {obj.type === "ellipse" && (
                        <div
                          className="h-full w-full"
                          style={{
                            borderRadius: "50%",
                            background: obj.fill || "#E5E7EB",
                            border: `${obj.strokeWidth || 2}px solid ${obj.stroke || "transparent"}`,
                            opacity: obj.opacity ?? 1,
                          }}
                        />
                      )}

                      {(obj.type === "line" || obj.type === "arrow") && (
                        <div
                          className="absolute top-1/2 origin-left"
                          style={{
                            width: obj.w,
                            height: obj.strokeWidth || 4,
                            background: obj.stroke || "#1F2937",
                            transform: `translateY(-50%)`,
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {(!activeSlide || activeSlide.objects.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-[#94A3B8]">
                    Double-click to add text, or use the toolbar to insert shapes and tables.
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="w-[260px] rounded-3xl bg-white/80 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur space-y-4">
            <section>
              <h2 className="text-sm font-semibold text-[#475569] uppercase tracking-wide mb-3">
                Selection
              </h2>
              {selectedObjects.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">Select an object to edit properties.</p>
              ) : (
                <div className="space-y-2 text-sm text-[#475569]">
                  <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
                    Selected: {selectedObjects.length}
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
                    Type: {selectedObjects.length === 1 ? selectedObjects[0].type : "Multiple"}
                  </div>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#475569] uppercase tracking-wide mb-3">
                Text
              </h3>
              <fieldset disabled={!selectedTextObject} className={`${!selectedTextObject ? "opacity-50" : "opacity-100"}`}>
                <div className="space-y-4 text-sm text-[#475569]">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs uppercase tracking-wide text-[#94A3B8]">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={96}
                      value={Math.round(currentFontSize)}
                      onChange={(event) =>
                        updateSelectedText(() => ({
                          fontSize: Math.min(96, Math.max(8, Number(event.target.value) || DEFAULT_TEXT_PROPS.fontSize)),
                        }))
                      }
                      className="w-20 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-right"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedText((obj) => ({ fontWeight: obj.fontWeight >= 600 ? 400 : 700 }))
                      }
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        currentBold ? "border-[#1B1533] bg-[#EEF2FF] text-[#1B1533]" : "border-[#E2E8F0] bg-white"
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedText((obj) => ({ italic: !obj.italic }))
                      }
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold italic transition ${
                        currentItalic ? "border-[#1B1533] bg-[#EEF2FF] text-[#1B1533]" : "border-[#E2E8F0] bg-white"
                      }`}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedText((obj) => ({ underline: !obj.underline }))
                      }
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        currentUnderline ? "border-[#1B1533] bg-[#EEF2FF] text-[#1B1533]" : "border-[#E2E8F0] bg-white"
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
                    ].map(({ icon, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateSelectedText(() => ({ align: value }))}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          currentAlign === value
                            ? "border-[#1B1533] bg-[#EEF2FF] text-[#1B1533]"
                            : "border-[#E2E8F0] bg-white"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wide text-[#94A3B8]">
                      Color
                    </label>
                    <button
                      type="button"
                      ref={inspectorColorRef}
                      onClick={() => openColorPanel(inspectorColorRef.current)}
                      className="mt-2 flex h-9 w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-3 py-1 text-sm"
                    >
                      <span className="text-[#475569]">{currentColor}</span>
                      <span
                        className="h-5 w-5 rounded-full border border-[#CBD0D9]"
                        style={{ background: currentColor }}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wide text-[#94A3B8]">
                      Line Height ({currentLineHeight.toFixed(2)})
                    </label>
                    <input
                      type="range"
                      min={0.8}
                      max={2}
                      step={0.05}
                      value={currentLineHeight}
                      onChange={(event) =>
                        updateSelectedText(() => ({ lineHeight: Number(event.target.value) }))
                      }
                      className="mt-2 w-full"
                    />
                  </div>
                </div>
              </fieldset>
            </section>
          </aside>
        </div>
      </div>

      {colorPanel.open && (
        <div
          ref={colorPanelRef}
          className="fixed z-50 w-[228px] rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.2)]"
          style={{ top: colorPanel.top, left: colorPanel.left }}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Presets
          </div>
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
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Recent
              </div>
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
            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Custom
            </label>
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
