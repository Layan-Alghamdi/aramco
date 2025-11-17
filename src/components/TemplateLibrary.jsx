import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { slideTemplates } from "../data/templates";
import Template1Viewer from "./Template1Viewer";

export default function TemplateLibrary({ onUseTemplate, selectedTemplateId, onTemplateSelect }) {
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
    navigate("/create", { state: { openTemplate1Editor: true } });
  };

  const handleTemplateClick = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template.id);
    }
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {templateOptions.map((template) => {
          const isActive = selectedTemplateId === template.id;
          return (
            <div
              key={template.id}
              className={`relative cursor-pointer rounded-3xl border bg-white/85 px-5 py-4 shadow-[0_10px_28px_rgba(62,109,204,0.12)] transition hover:shadow-[0_14px_32px_rgba(62,109,204,0.18)] ${
                isActive ? "border-[#3E6DCC] ring-2 ring-[#3E6DCC]/30" : "border-[#D8DEEA]"
              }`}
              onClick={() => handleTemplateClick(template)}
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
                    {isActive && <span className="text-xs font-semibold text-[#3E6DCC]">Selected</span>}
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
                          handleTemplateClick(template);
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
      <Template1Viewer isOpen={template1ViewerOpen} onClose={closeTemplate1Preview} />
    </>
  );
}

