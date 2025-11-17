import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Folder, UserPlus } from "lucide-react";
import SharedHeader from "@/components/SharedHeader";
import Toast from "@/components/Toast";
import TeamsGrid from "@/components/TeamsGrid";
import TemplateLibraryModal from "@/components/TemplateLibraryModal";
import useTeams from "@/hooks/useTeams";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useProjects } from "@/context/ProjectsContext";
import { getTemplatesForUser, recordProjectForUser } from "@/lib/usersStore";
import { cloneTemplateSlides, slideTemplates } from "@/data/templates";
import useThemeMode from "@/hooks/useThemeMode";

const iconColor = "#3E6DCC";
const iconSize = 28;

const icons = {
  plusCircle: <PlusCircle size={iconSize} color={iconColor} strokeWidth={1.5} />,
  folder: <Folder size={iconSize} color={iconColor} strokeWidth={1.5} />,
  userPlus: <UserPlus size={iconSize} color={iconColor} strokeWidth={1.5} />
};

const quickCards = [
  { title: "Create", path: "/create", icon: icons.plusCircle },
  { title: "Projects", path: "/projects", icon: icons.folder }
];

const missingRoutes = new Set(["/projects"]);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState("");
  const [templateLibraryModalOpen, setTemplateLibraryModalOpen] = useState(false);
  const teams = useTeams();
  const user = useCurrentUser();
  const { projects, addProject } = useProjects();
  const themeMode = useThemeMode();
  const isDarkMode = themeMode === "dark";

  const myProjectsCount = useMemo(() => {
    if (!user) return 0;
    return projects.filter((project) => {
      if (project.ownerId && project.ownerId === user.id) return true;
      if (project.ownerEmail && user.email) {
        return project.ownerEmail.toLowerCase() === user.email.toLowerCase();
      }
      if (project.ownerName && user.name) {
        return project.ownerName.toLowerCase() === user.name.toLowerCase();
      }
      return false;
    }).length;
  }, [projects, user]);

  const myTemplatesCount = useMemo(() => {
    if (!user?.id) return 0;
    return getTemplatesForUser(user.id).length;
  }, [user?.id]);

  const myTeamsCount = useMemo(() => {
    if (!user) return 0;
    return teams.filter((team) => team.createdById === user.id).length;
  }, [teams, user]);

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      setTimeout(() => setToast(""), 2200);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const handleCreateProject = useCallback(async () => {
    try {
      const defaultTemplate = slideTemplates[0];
      const slides = cloneTemplateSlides(defaultTemplate.id);
      const project = addProject({
        name: "Untitled project",
        description: "",
        templateId: defaultTemplate.id,
        slides,
        status: "Draft",
        ownerId: user?.id ?? null,
        ownerName: user?.name ?? "You",
        ownerEmail: user?.email ?? "",
        ownerRole: user?.role ?? ""
      });

      if (user?.id) {
        recordProjectForUser(user.id, project.id);
      }

      navigate(`/editor/${project.id}`, { state: { from: "create", highlightProjectId: project.id } });
    } catch (error) {
      console.error("Failed to create project", error);
      setToast("Failed to create project. Please try again.");
      setTimeout(() => setToast(""), 3000);
    }
  }, [addProject, user, navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dashboard-surface", "dark-dashboard");
    } else {
      document.body.classList.remove("dashboard-surface", "dark-dashboard");
    }
    return () => {
      document.body.classList.remove("dashboard-surface", "dark-dashboard");
    };
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      if (!cmdOrCtrl) return;

      const target = event.target;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      const key = event.key.toLowerCase();

      if (key === "c") {
        event.preventDefault();
        event.stopPropagation();
        handleCreateProject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCreateProject]);

  const handleCardClick = (path) => {
    if (!path) return;
    if (path === "/create") {
      handleCreateProject();
      return;
    }
    if (path === "/projects") {
      navigate("/projects");
      return;
    }
    if (missingRoutes.has(path)) {
      setToast("Not implemented yet");
      setTimeout(() => setToast(""), 2200);
      return;
    }
    navigate(path);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <>
      <SharedHeader variant="dashboard" />
      <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10">
        <div className="relative w-full max-w-[1200px] rounded-[24px] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] px-10 py-12">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Welcome back</p>
                  <h2 className="text-2xl font-semibold text-[#0F172A]">{user?.name ? `${user.name}` : "Design Studio Member"}</h2>
                  <p className="text-sm text-[#4B5563]">{user?.role ?? "Collaborator"} • {user?.department ?? "Aramco Digital"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1F2937]/10 px-4 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#1F2937]/15 transition"
                >
                  Profile
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 xl:gap-10">
              {quickCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => handleCardClick(card.path)}
                  className="w-[220px] h-[180px] sm:w-[220px] sm:h-[190px] lg:w-[240px] lg:h-[190px] xl:w-[260px] xl:h-[200px] rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] flex flex-col items-center justify-center gap-4 text-[#4B5563] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-lg font-semibold">{card.title}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigate("/teams/new")}
                className="w-[220px] h-[180px] sm:w-[220px] sm:h-[190px] lg:w-[240px] lg:h-[190px] xl:w-[260px] xl:h-[200px] rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] flex flex-col items-center justify-center gap-4 text-[#4B5563] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              >
                <div className="w-[52px] h-[52px] rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
                  {icons.userPlus}
                </div>
                <span className="text-lg font-semibold">New team</span>
              </button>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] px-6 py-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B1533] mb-2">Template library</h2>
                  <p className="text-sm text-[#6B7280]">
                    Choose a branded template to jump-start your design. Slides are fully editable once you launch the studio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTemplateLibraryModalOpen(true)}
                  className="inline-flex items-center rounded-full bg-[#3E6DCC] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(62,109,204,0.28)] hover:shadow-[0_14px_26px_rgba(62,109,204,0.36)] transition"
                >
                  Start from template
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] px-6 py-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] border border-[#E5E7EB]">
                    <span className="text-sm font-semibold text-[#4B5563]">👥</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B1533]">Your teams</h2>
                    <p className="text-sm text-[#6B7280]">Quickly access the teams you manage.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/teams/new")}
                  className="inline-flex items-center rounded-full bg-[#1B1533] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                >
                  Create team
                </button>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <a
                  href="https://outlook.office.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white dark:bg-[#0F1B2D] border border-[#E5E7EB] dark:border-[#1F2A40] text-[#1A1A1A] dark:text-white px-5 py-2.5 text-sm font-semibold shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(0,255,255,0.4),0_0_25px_rgba(0,150,255,0.2)] transition-all duration-200 hover:scale-[1.02]"
                >
                  Outlook
                </a>
                <a
                  href="https://teams.microsoft.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white dark:bg-[#0F1B2D] border border-[#E5E7EB] dark:border-[#1F2A40] text-[#1A1A1A] dark:text-white px-5 py-2.5 text-sm font-semibold shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(0,255,255,0.4),0_0_25px_rgba(0,150,255,0.2)] transition-all duration-200 hover:scale-[1.02]"
                >
                  Microsoft Teams
                </a>
              </div>
              <div className="mt-6">
                <TeamsGrid teams={teams} />
              </div>
            </div>
          </div>

          <Toast message={toast} />
        </div>
      </section>
      <TemplateLibraryModal
        isOpen={templateLibraryModalOpen}
        onClose={() => setTemplateLibraryModalOpen(false)}
        onUseTemplate={async (template) => {
          try {
            const slides = cloneTemplateSlides(template.id);
            const project = addProject({
              name: "Untitled project",
              description: "",
              templateId: template.id,
              slides,
              status: "Draft",
              ownerId: user?.id ?? null,
              ownerName: user?.name ?? "You",
              ownerEmail: user?.email ?? "",
              ownerRole: user?.role ?? ""
            });

            if (user?.id) {
              recordProjectForUser(user.id, project.id);
            }

            navigate(`/editor/${project.id}`, { state: { from: "create", highlightProjectId: project.id } });
          } catch (error) {
            console.error("Failed to create project", error);
            setToast("Failed to create project. Please try again.");
            setTimeout(() => setToast(""), 3000);
          }
        }}
      />
    </>
  );
}

