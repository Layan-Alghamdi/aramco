import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "presentation.current";

const baseSlides = [
  { id: "slide-1", title: "Slide 1" },
  { id: "slide-2", title: "Slide 2" }
];

export default function Editor() {
  const [slides, setSlides] = useState(baseSlides);
  const [activeId, setActiveId] = useState(baseSlides[0].id);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          setSlides(parsed.slides);
          setActiveId(parsed.activeId ?? parsed.slides[0].id);
        }
      }
    } catch (error) {
      console.warn("Failed to load presentation", error);
    }
  }, []);

  // Persist to localStorage whenever slides or active slide changes
  useEffect(() => {
    const payload = JSON.stringify({ slides, activeId });
    localStorage.setItem(STORAGE_KEY, payload);
  }, [slides, activeId]);

  useEffect(() => {
    if (slides.length === 0) {
      setSlides(baseSlides);
      setActiveId(baseSlides[0].id);
      return;
    }
    const exists = slides.some((slide) => slide.id === activeId);
    if (!exists) {
      setActiveId(slides[0].id);
    }
  }, [slides, activeId]);

  const activeIndex = useMemo(() => {
    if (!slides || slides.length === 0) return -1;
    return slides.findIndex((slide) => slide.id === activeId);
  }, [slides, activeId]);

  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeSlide = slides[safeActiveIndex];

  const handleNewSlide = () => {
    const nextNumber = slides.length + 1;
    const newSlide = {
      id: `slide-${nextNumber}`,
      title: `Slide ${nextNumber}`
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveId(newSlide.id);
  };

  const handleSelectSlide = (slideId) => {
    setActiveId(slideId);
  };

  return (
    <div
      id="editor-ok"
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        background: "#000",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: 8,
        zIndex: 9999
      }}
    >
      Editor OK
    </div>
  );

  /*
  if (!slides || slides.length === 0) {
    return (
      <section className="min-h-[88vh] w-full flex items-center justify-center font-[Inter,ui-sans-serif]">
        <div className="rounded-3xl bg-white/80 px-6 py-4 shadow-md backdrop-blur">
          Loading slides…
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]">
      <div className="relative w-full max-w-[1400px] overflow-hidden rounded-[28px] min-h-[640px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)'
          }}
        />

        <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-9 gap-6">
          {/* TEMP */}
          <div data-test="editor-ok" className="fixed top-2 right-2 rounded bg-black px-2 py-1 text-xs font-semibold text-white">
            Editor OK
          </div>

          {/* Toolbar */}
          <div className="sticky top-8 z-20 flex items-center gap-3 self-start rounded-full bg-white/80 px-6 py-3 shadow-md backdrop-blur">
            <button
              type="button"
              className="rounded-full bg-[#1B1533] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 transition"
              onClick={handleNewSlide}
            >
              New Slide
            </button>
            <button type="button" className="rounded-full border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#94A3B8]" disabled>
              Delete Slide
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-full border border-[#D1D5DB] px-3 py-2 text-sm font-medium text-[#94A3B8]" disabled>
                Undo
              </button>
              <button type="button" className="rounded-full border border-[#D1D5DB] px-3 py-2 text-sm font-medium text-[#94A3B8]" disabled>
                Redo
              </button>
            </div>
            <button type="button" className="rounded-full border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#94A3B8]" disabled>
              Export
            </button>
          </div>

          {/* Main content area */}
          <div className="flex flex-1 gap-6 overflow-hidden">
            {/* Slides sidebar */}
            <aside className="w-[220px] flex-shrink-0 rounded-3xl bg-white/80 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="mb-4 text-sm font-semibold text-[#475569] uppercase tracking-wide">
                Slides
              </div>
              <div className="space-y-3 overflow-auto pr-1" style={{ maxHeight: "calc(100vh - 240px)" }}>
                {slides.map((slide, index) => {
                  const isActive = slide.id === activeId;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => handleSelectSlide(slide.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-[#1B1533] bg-[#F2F3FF] text-[#1B1533]"
                          : "border-transparent bg-white/80 text-[#475569] hover:border-[#CBD0D9]"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide text-[#94A3B8]">Slide {index + 1}</div>
                      <div className="text-sm font-semibold">{slide.title}</div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Canvas area */}
            <main className="flex-1 flex items-center justify-center">
              <div className="relative flex items-center justify-center rounded-[32px] bg-white/80 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur">
                <div className="relative aspect-[16/9] w-full max-w-[720px] rounded-3xl bg-white shadow-[0_20px_48px_rgba(15,23,42,0.18)]">
                  <div className="absolute inset-0 rounded-3xl border border-[#E2E8F0]" />
                  <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center text-[#1E293B]">
                    <div className="rounded-full bg-[#EEF2FF] px-4 py-1 text-sm font-semibold text-[#4338CA]">
                      Slide {safeActiveIndex + 1}
                    </div>
                    <h2 className="text-2xl font-bold">{activeSlide?.title ?? "Untitled"}</h2>
                    <p className="max-w-[420px] text-sm text-[#64748B]">
                      Placeholder preview. Future editing tools will render objects here.
                    </p>
                  </div>
                </div>
              </div>
            </main>

            {/* Inspector */}
            <aside className="w-[260px] flex-shrink-0 rounded-3xl bg-white/80 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="mb-4 text-sm font-semibold text-[#475569] uppercase tracking-wide">
                Inspector
              </div>
              <div className="space-y-4 text-sm text-[#475569]">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-[#94A3B8]">Size</label>
                  <input
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 focus:border-[#6366F1] focus:outline-none"
                    placeholder="Width × Height"
                    disabled
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-[#94A3B8]">Position</label>
                  <input
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 focus:border-[#6366F1] focus:outline-none"
                    placeholder="X, Y"
                    disabled
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-[#94A3B8]">Font Size</label>
                  <input
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 focus:border-[#6366F1] focus:outline-none"
                    placeholder="16"
                    disabled
                  />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Detailed controls will appear here once object editing is enabled.
                </p>
              </div>
            </aside>
          </div>

          {toast && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-[#1F2937] px-4 py-2 text-sm text-white shadow-lg">
              {toast}
            </div>
          )}
        </div>
      </div>
    </section>
  );
  */
}


