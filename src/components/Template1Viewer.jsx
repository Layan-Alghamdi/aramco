import React, { useEffect, useRef, useState } from "react";

export default function Template1Viewer({ isOpen, onClose, pptxPath = "/templates/Template1.pptx" }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomLevel, setZoomLevel] = useState("fit");
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Load slides - check for pre-rendered images first, otherwise use canvas rendering
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setCurrentSlide(0);
    
    // Try to load pre-rendered slide images
    const checkForPreRenderedSlides = async () => {
      const slideImages = [];
      let slideIndex = 1;
      let foundSlides = false;
      
      // Check for pre-rendered images (slide-001.png, slide-002.png, etc.)
      while (slideIndex <= 20) {
        const slideNum = String(slideIndex).padStart(3, "0");
        const imagePath = `/templates/template1_slides/slide-${slideNum}.png`;
        
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              slideImages.push({
                id: slideIndex,
                type: "image",
                imagePath: imagePath
              });
              foundSlides = true;
              resolve();
            };
            img.onerror = () => {
              reject();
            };
            img.src = imagePath;
          });
          slideIndex++;
        } catch {
          break;
        }
      }
      
      if (foundSlides && slideImages.length > 0) {
        setSlides(slideImages);
        setLoading(false);
        return;
      }
      
      // Fallback: Use canvas-rendered slides based on template structure
      setSlides([
        {
          id: 1,
          type: "cover",
          title: "Template 1 Presentation",
          subtitle: "Download the full PowerPoint deck from the template library.",
          gradient: "linear-gradient(140deg, #0A2342 0%, #3E6DCC 55%, #00A19A 100%)"
        },
        {
          id: 2,
          type: "content",
          title: "Why this deck works",
          content: "Branded master slides\nUpdated icon set\nAccessible color contrast\n\nExecutive-ready layouts\nAgenda, KPI, timeline, and summary views"
        }
      ]);
      setLoading(false);
    };
    
    checkForPreRenderedSlides();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || slides.length === 0) return;
    if (slides[currentSlide]?.type === "image") {
      // Image-based slides don't need canvas rendering
      return;
    }
    if (canvasRef.current) {
      renderSlide();
    }
  }, [currentSlide, zoomLevel, slides, isOpen]);

  const renderSlide = () => {
    const canvas = canvasRef.current;
    if (!canvas || slides.length === 0) return;
    const ctx = canvas.getContext("2d");
    const slide = slides[currentSlide];
    if (!slide) return;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const aspectRatio = 16 / 9;
    let width, height;

    if (zoomLevel === "fit") {
      width = Math.min(containerRect.width - 80, 1280);
      height = width / aspectRatio;
    } else {
      const zoom = parseInt(zoomLevel) / 100;
      width = 1280 * zoom;
      height = 720 * zoom;
    }

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (slide.type === "cover") {
      // Render cover slide
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0A2342");
      gradient.addColorStop(0.55, "#3E6DCC");
      gradient.addColorStop(1, "#00A19A");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // White card
      const cardX = width * 0.094;
      const cardY = height * 0.163;
      const cardW = width * 0.813;
      const cardH = height * 0.674;
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      roundRect(ctx, cardX, cardY, cardW, cardH, 36);
      ctx.fill();

      // Title
      ctx.fillStyle = "#3E6DCC";
      ctx.font = `700 ${width * 0.048}px Poppins, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(slide.title, width / 2, height * 0.37);

      // Subtitle
      ctx.fillStyle = "#6B7280";
      ctx.font = `400 ${width * 0.023}px Poppins, sans-serif`;
      const lines = wrapText(ctx, slide.subtitle, width * 0.563);
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, height * 0.52 + i * (width * 0.023 * 1.5));
      });
    } else {
      // Render content slide
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#1E1E1E";
      ctx.font = `600 ${width * 0.035}px Poppins, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(slide.title, width * 0.125, height * 0.185);

      ctx.fillStyle = "#6B7280";
      ctx.font = `400 ${width * 0.019}px Poppins, sans-serif`;
      const lines = wrapText(ctx, slide.content, width * 0.75);
      lines.forEach((line, i) => {
        ctx.fillText(line, width * 0.125, height * 0.37 + i * (width * 0.019 * 1.6));
      });
    }
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split("\n");
    const lines = [];
    words.forEach((word) => {
      if (word.trim() === "") {
        lines.push("");
        return;
      }
      const testLine = lines.length > 0 ? lines[lines.length - 1] + " " + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && lines.length > 0) {
        lines.push(word);
      } else {
        if (lines.length === 0) {
          lines.push(word);
        } else {
          lines[lines.length - 1] = testLine;
        }
      }
    });
    return lines;
  };

  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        prevSlide();
      } else if (event.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide, slides.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#0F172A] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Template 1 Viewer"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Template 1</h2>
          <span className="text-sm text-white/60">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={zoomLevel}
            onChange={(e) => setZoomLevel(e.target.value)}
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

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails sidebar */}
        <div className="w-48 border-r border-white/10 bg-[#1E293B] overflow-y-auto p-4">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`w-full aspect-video rounded-lg border-2 overflow-hidden transition ${
                  currentSlide === index
                    ? "border-[#3E6DCC] ring-2 ring-[#3E6DCC]/30"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {slide.type === "image" ? (
                  <img
                    src={slide.imagePath}
                    alt={`Slide ${index + 1} thumbnail`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background:
                        slide.type === "cover"
                          ? "linear-gradient(140deg, #0A2342 0%, #3E6DCC 55%, #00A19A 100%)"
                          : "#FFFFFF"
                    }}
                  >
                    <span className={slide.type === "cover" ? "text-white" : "text-[#1E1E1E]"}>
                      {index + 1}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Slide viewer */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-auto p-8 bg-[#0F172A]"
        >
          {loading ? (
            <div className="text-white/60">Loading slides...</div>
          ) : slides[currentSlide]?.type === "image" ? (
            <div className="relative">
              <img
                src={slides[currentSlide].imagePath}
                alt={`Slide ${currentSlide + 1}`}
                className="shadow-2xl border border-white/10 rounded-lg"
                style={{
                  maxWidth: zoomLevel === "fit" ? "100%" : `${zoomLevel}%`,
                  height: "auto"
                }}
              />
            </div>
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="shadow-2xl border border-white/10 rounded-lg"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition ${
                currentSlide === index ? "w-8 bg-[#3E6DCC]" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

