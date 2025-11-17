import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { cloneTemplateSlides, slideTemplates } from "../data/templates";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { recordProjectForUser } from "@/lib/usersStore";
import SharedHeader from "@/components/SharedHeader";
import Template1Editor from "@/components/Template1Editor";

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
  const location = useLocation();
  const { addProject } = useProjects();
  const currentUser = useCurrentUser();

  const [form, setForm] = useState(() => ({ ...initialFormState }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(`AI Suggestion • Focus on: ${slideTemplates[0].description}`);
  const [template1EditorOpen, setTemplate1EditorOpen] = useState(false);
  const handlersRef = useRef({ handleSaveProject: null, handleNewProject: null, handleCreate: null });

  useEffect(() => {
    if (location.state?.openTemplate1Editor) {
      setTemplate1EditorOpen(true);
      const newState = { ...location.state };
      delete newState.openTemplate1Editor;
      navigate(location.pathname, { replace: true, state: newState });
    }
    if (location.state?.selectedTemplateId) {
      setForm((prev) => ({ ...prev, templateId: location.state.selectedTemplateId }));
      const template = slideTemplates.find((t) => t.id === location.state.selectedTemplateId);
      if (template) {
        setAiSuggestion(`AI Suggestion • Focus on: ${template.description}`);
      }
      const newState = { ...location.state };
      delete newState.selectedTemplateId;
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [location, navigate]);


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

  const closeTemplate1Editor = () => {
    setTemplate1EditorOpen(false);
  };

  const resetForm = useCallback(() => {
    setForm({ ...initialFormState });
    setError("");
    setAiSuggestion(`AI Suggestion • Focus on: ${slideTemplates[0].description}`);
  }, []);

  const handleSaveProject = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }
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
  }, [form, addProject, currentUser, navigate, resetForm]);

  const handleNewProject = useCallback(() => {
    resetForm();
    setSuccessMessage("New project started.");
    setTimeout(() => setSuccessMessage(""), 2000);
  }, [resetForm]);

  useEffect(() => {
    handlersRef.current = { handleSaveProject, handleNewProject };
  }, [handleSaveProject, handleNewProject]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleSaveProject(event);
  };

  useEffect(() => {
    if (template1EditorOpen) {
      console.log("Keyboard shortcuts disabled - modal is open");
      return;
    }

    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Debug: log all Cmd/Ctrl key presses
      if (cmdOrCtrl) {
        console.log("Cmd/Ctrl pressed with key:", event.key, "target:", event.target.tagName);
      }

      if (!cmdOrCtrl) return;

      const target = event.target;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) {
        console.log("Ignoring shortcut - user is typing in input");
        return;
      }

      const key = event.key.toLowerCase();
      console.log("Processing shortcut key:", key, "handlers available:", !!handlersRef.current.handleSaveProject);

      if (key === "s") {
        event.preventDefault();
        event.stopPropagation();
        console.log("Keyboard shortcut: Cmd/Ctrl+S triggered");
        if (handlersRef.current.handleSaveProject) {
          handlersRef.current.handleSaveProject(event);
        } else {
          console.error("handleSaveProject not available in ref");
        }
      } else if (key === "n") {
        event.preventDefault();
        event.stopPropagation();
        console.log("Keyboard shortcut: Cmd/Ctrl+N triggered");
        if (handlersRef.current.handleNewProject) {
          handlersRef.current.handleNewProject();
        } else {
          console.error("handleNewProject not available in ref");
        }
      }
    };

    console.log("Keyboard shortcuts listener attached to window");
    console.log("Handlers ref:", handlersRef.current);
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      console.log("Keyboard shortcuts listener removed");
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [template1EditorOpen]);

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <SharedHeader variant="dashboard" />
      <section className="min-h-screen relative font-['Poppins',ui-sans-serif] text-[#1E1E1E] pt-[72px] px-8 pb-10 animate-fade-in">
        <div className="flex flex-col gap-2">
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

          <div className="mt-8 mx-auto w-full max-w-4xl rounded-[30px] bg-white/80 backdrop-blur-lg p-10 shadow-[0_24px_50px_rgba(62,109,204,0.20)] border border-white/50">
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

              <div>
                <InputLabel htmlFor="templateId">Template</InputLabel>
                <p className="text-sm text-[#6B7280] mb-4">
                  Select a template from the library on the Dashboard to use for this project.
                </p>
                <select
                  id="templateId"
                  name="templateId"
                  value={form.templateId}
                  onChange={handleTemplateChange}
                  className="w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-base shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                >
                  {slideTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

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
      <Template1Editor
        isOpen={template1EditorOpen}
        onClose={closeTemplate1Editor}
        onBackToLibrary={() => setTemplate1EditorOpen(false)}
      />
    </div>
  );
}

