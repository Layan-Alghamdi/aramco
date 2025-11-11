import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { cloneTemplateSlides, slideTemplates } from "../templates/brandTemplates";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { recordProjectForUser } from "@/lib/usersStore";
import SharedHeader from "../SharedHeader";

const backgroundLayers = [
  "linear-gradient(110deg, #0C7C59 0%, #00A19A 40%, #3E6DCC 100%)",
  "radial-gradient(125% 125% at 0% 0%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 65%)",
  "radial-gradient(120% 120% at 100% 100%, rgba(12,124,89,0.38) 0%, rgba(62,109,204,0.18) 35%, rgba(62,109,204,0) 70%)"
];

const initialFormState = {
  name: "",
  description: "",
  templateId: slideTemplates[0].id
};

const InputLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-[#1E1E1E] mb-1.5">
    {children}
  </label>
);

const backgroundStyle = {
  background: "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)"
};

export default function CreateProject() {
  const navigate = useNavigate();
  const { addProject } = useProjects();
  const currentUser = useCurrentUser();

  const [form, setForm] = useState(() => ({ ...initialFormState }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(`AI Suggestion • Focus on: ${slideTemplates[0].description}`);

  const templateOptions = useMemo(
    () =>
      slideTemplates.map((template) => ({
        ...template,
        tone: template.name.includes("Title") ? "Launch with impact" : "Shape the narrative"
      })),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    setForm((prev) => ({ ...prev, templateId }));
    const template = slideTemplates.find((item) => item.id === templateId);
    if (template) {
      setAiSuggestion(`AI Suggestion • Focus on: ${template.description}`);
    }
  };

  const resetForm = () => {
    setForm({ ...initialFormState });
    setError("");
    setAiSuggestion(`AI Suggestion • Focus on: ${slideTemplates[0].description}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Please provide a project name before saving.");
      return;
    }
    if (!form.templateId) {
      setError("Select a template to continue.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const slides = cloneTemplateSlides(form.templateId);
      const project = addProject({
        name: form.name.trim(),
        description: form.description.trim(),
        templateId: form.templateId,
        slides,
        status: "Draft",
        ownerId: currentUser?.id ?? null,
        ownerName: currentUser?.name ?? "You",
        ownerEmail: currentUser?.email ?? "",
        ownerRole: currentUser?.role ?? ""
      });

      setSuccessMessage("Project saved successfully.");
      resetForm();

      setTimeout(() => {
        navigate(`/editor/${project.id}`, { state: { from: "create", highlightProjectId: project.id } });
      }, 650);

      if (currentUser?.id) {
        recordProjectForUser(currentUser.id, project.id);
      }
    } catch (submitError) {
      console.error("Failed to save project", submitError);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <SharedHeader variant="dashboard" />
      <section className="min-h-screen relative font-['Poppins',ui-sans-serif] text-[#1E1E1E] pt-24 px-8 pb-10 animate-fade-in">
        <div className="flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Back to Dashboard
            </button>
          </header>

          <div className="mt-12 mx-auto w-full max-w-4xl rounded-[30px] bg-white/80 backdrop-blur-lg p-10 shadow-[0_24px_50px_rgba(62,109,204,0.20)] border border-white/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-[#1E1E1E]">Create a project</h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Capture the essentials and then shape slides directly inside the AI-assisted studio—no file uploads required.
                </p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <InputLabel htmlFor="name">Project name</InputLabel>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Regional AI Adoption Playbook"
                  className="w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-base shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                />
              </div>

              <div>
                <InputLabel htmlFor="description">Description</InputLabel>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add a short summary so teammates immediately understand the story."
                  className="w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-base shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition resize-none"
                />
              </div>

              <section>
                <InputLabel htmlFor="template">Template library</InputLabel>
                <p className="text-sm text-[#6B7280] mb-4">
                  Choose a branded template to jump-start design. Slides are fully editable once you launch the studio.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {templateOptions.map((template) => {
                    const isActive = form.templateId === template.id;
                    return (
                      <label
                        key={template.id}
                        className={`relative cursor-pointer rounded-3xl border bg-white/85 px-5 py-4 shadow-[0_10px_28px_rgba(62,109,204,0.12)] transition hover:shadow-[0_14px_32px_rgba(62,109,204,0.18)] ${
                          isActive ? "border-[#3E6DCC] ring-2 ring-[#3E6DCC]/30" : "border-[#D8DEEA]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="templateId"
                          value={template.id}
                          checked={isActive}
                          onChange={handleTemplateChange}
                          className="sr-only"
                        />
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
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-dashed border-[#C5D4F7] bg-white/70 px-5 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1E1E1E]">Custom templates</h4>
                    <p className="text-sm text-[#6B7280]">Save your own branded layouts for quick reuse. Coming soon – we&apos;ll plug in your library.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-medium text-[#6B7280] shadow-sm"
                    disabled
                  >
                    Save current slide (soon)
                  </button>
                </div>
              </section>

              {aiSuggestion && (
                <div className="rounded-2xl border border-[#C9E2FF] bg-[#E9F4FF] px-4 py-3 text-sm text-[#0C4A6E]">
                  {aiSuggestion}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-white transition"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#3E6DCC] px-6 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(62,109,204,0.35)] hover:shadow-[0_18px_30px_rgba(62,109,204,0.45)] transition disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? "Preparing studio…" : "Launch slide studio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

