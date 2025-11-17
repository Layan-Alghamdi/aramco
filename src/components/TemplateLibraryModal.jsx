import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slideTemplates } from "../data/templates";
import Template1Viewer from "./Template1Viewer";

export default function TemplateLibraryModal({ isOpen, onClose, onUseTemplate }) {
  const navigate = useNavigate();
  const [template1ViewerOpen, setTemplate1ViewerOpen] = useState(false);

  const templateOptions = useMemo(
    () =>
      slideTemplates.map((template) => ({
        ...template,
        tone: template.name.includes("Title") ? "Launch with impact" : "Shape the narrative"
      })),
    []
  );

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const openTemplate1Preview = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setTemplate1ViewerOpen(true);
  };

  const closeTemplate1Preview = () => {
    setTemplate1ViewerOpen(false);
  };

  const handleTemplate1EditNavigate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
    navigate("/create", { state: { openTemplate1Editor: true } });
  };

  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg text-gray-600 hover:text-gray-900 transition"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal content */}
          <div className="overflow-y-auto flex-1 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#1B1533] mb-2">Template library</h2>
              <p className="text-sm text-[#6B7280]">
                Choose a branded template to jump-start your design. Slides are fully editable once you launch the studio.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {templateOptions.map((template) => {
                return (
                  <div
                    key={template.id}
                    className="relative cursor-pointer rounded-3xl border border-[#D8DEEA] bg-white/85 px-5 py-4 shadow-[0_10px_28px_rgba(62,109,204,0.12)] transition hover:shadow-[0_14px_32px_rgba(62,109,204,0.18)]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-20 w-32 rounded-2xl border border-[#E5ECFF] bg-white shadow-inner flex items-center justify-center"
                        style={{
                          background:
                            template.previewAccent === "#FFFFFF"
                              ? "linear-gradient(135deg, #E6EEFF 0%, #FFFFFF 100%)"
                              : `linear-gradient(135deg, ${template.previewAccent} 0%, rgba(230,238,255,0.65) 100%)`
                        }}
                      >
                        <div className="h-[52px] w-[78px] rounded-xl bg-white/85 shadow-[0_6px_18px_rgba(0,0,0,0.12)] relative overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-[#1E1E1E]">{template.name}</h3>
                        </div>
                        <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{template.description}</p>
                        <p className="mt-3 text-xs uppercase tracking-wide text-[#93A3C3]">{template.tone}</p>
                        {template.id === "template-1-presentation" ? (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={openTemplate1Preview}
                              className="inline-flex items-center rounded-full border border-[#3E6DCC] bg-white px-4 py-2 text-xs font-semibold text-[#3E6DCC] shadow-sm transition hover:bg-[#EEF2FF]"
                            >
                              Preview
                            </button>
                            <a
                              href={template.assetPath ?? "/templates/Template1.pptx"}
                              download
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-full bg-[#3E6DCC] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(62,109,204,0.28)] hover:shadow-[0_14px_26px_rgba(62,109,204,0.36)] transition"
                            >
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={handleTemplate1EditNavigate}
                              className="inline-flex items-center rounded-full border border-[#003D73] bg-white px-4 py-2 text-xs font-semibold text-[#003D73] shadow-sm transition hover:bg-[#F0F5F9]"
                            >
                              Edit in /create
                            </button>
                          </div>
                        ) : template.assetPath ? (
                          <div className="mt-4">
                            <a
                              href={template.assetPath}
                              download
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-full bg-[#3E6DCC] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(62,109,204,0.28)] hover:shadow-[0_14px_26px_rgba(62,109,204,0.36)] transition"
                            >
                              Use this template
                            </a>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseTemplate(template);
                              }}
                              className="inline-flex items-center rounded-full bg-[#3E6DCC] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(62,109,204,0.28)] hover:shadow-[0_14px_26px_rgba(62,109,204,0.36)] transition"
                            >
                              Use this template
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Template1Viewer isOpen={template1ViewerOpen} onClose={closeTemplate1Preview} />
    </>
  );
}

