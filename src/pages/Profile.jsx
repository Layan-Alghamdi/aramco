import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useProjects } from "@/context/ProjectsContext";
import useTeams from "@/hooks/useTeams";
import { getTemplatesForUser, signOutUser } from "@/lib/usersStore";
import useThemeMode from "@/hooks/useThemeMode";

const accountSettings = [
  "Change Password",
  "Notification Preferences",
  "Theme: Light / Dark",
  "Log Out"
];

function getInitials(value) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default function Profile() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { projects } = useProjects();
  const teams = useTeams();
  const themeMode = useThemeMode();

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  const myProjects = useMemo(() => {
    if (!user) return [];
    return projects
      .filter((project) => {
        if (project.ownerId && project.ownerId === user.id) return true;
        if (project.ownerEmail && user.email) {
          return project.ownerEmail.toLowerCase() === user.email.toLowerCase();
        }
        if (project.ownerName && user.name) {
          return project.ownerName.toLowerCase() === user.name.toLowerCase();
        }
        return false;
      })
      .slice(0, 6);
  }, [projects, user]);

  const myTemplates = useMemo(() => {
    if (!user?.id) return [];
    return getTemplatesForUser(user.id);
  }, [user?.id]);

  const myTeams = useMemo(() => {
    if (!user) return [];
    return teams
      .filter((team) => team.createdById === user.id)
      .slice(0, 4);
  }, [teams, user]);

  useEffect(() => {
    document.body.classList.add("profile-surface");
    return () => {
      document.body.classList.remove("profile-surface");
      document.body.classList.remove("dark-profile");
    };
  }, []);

  useEffect(() => {
    if (themeMode === "dark") {
      document.body.classList.add("dark-profile");
    } else {
      document.body.classList.remove("dark-profile");
    }
  }, [themeMode]);

  const handleLogout = () => {
    signOutUser();
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleSettingAction = (setting) => {
    switch (setting) {
      case "Change Password":
        navigate("/profile/password");
        break;
      case "Notification Preferences":
        navigate("/profile/notifications");
        break;
      case "Theme: Light / Dark":
        navigate("/profile/theme");
        break;
      case "Log Out":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <section className="profile-shell min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif] bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] transition-colors duration-200 ease-out dark:bg-[linear-gradient(180deg,#0f1b2d_0%,#0b1426_100%)]">
      <div className="profile-frame w-full max-w-[1200px] rounded-[28px] bg-white shadow-[0_12px_50px_rgba(31,41,55,0.12)] transition-colors duration-200 ease-out">
        <div className="profile-frame-inner flex h-full flex-col px-10 pt-8 pb-12">
          <header className="profile-header flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="profile-logo h-14 w-auto md:h-16" />
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="profile-back-btn inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="profile-body flex-1 flex items-center justify-center py-10">
            <div className="w-full flex flex-col gap-8">
              <section className="profile-card profile-card--hero mx-auto w-full max-w-[680px] rounded-[26px] border border-white/70 bg-white/80 backdrop-blur-sm px-10 py-8 shadow-[0_12px_50px_rgba(31,41,55,0.08)] transition-colors duration-200 ease-out">
                <div className="flex flex-col items-center gap-6 text-center">
                  {user?.avatarUrl ? (
                    <div className="profile-avatar-wrapper h-32 w-32 overflow-hidden rounded-full border-4 border-white/70 shadow-lg">
                      <img src={user.avatarUrl} alt={user.name || "Profile avatar"} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="profile-avatar-placeholder flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/70 bg-white text-4xl font-semibold text-black shadow-lg dark:text-[#0f182c]">
                      {initials?.slice(0, 1) || ""}
                    </div>
                  )}
                  <div className="profile-info space-y-3 w-full max-w-[360px] text-left">
                    <p className="profile-info-row text-base font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                      Name: <span className="font-normal text-[#4B5563] dark:text-[#a7b7d0]">{user?.name || ".........."}</span>
                    </p>
                    <p className="profile-info-row text-base font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                      Department: <span className="font-normal text-[#4B5563] dark:text-[#a7b7d0]">{user?.department || ".........."}</span>
                    </p>
                    <p className="profile-info-row text-base font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                      Role: <span className="font-normal text-[#4B5563] dark:text-[#a7b7d0]">{user?.role || ".........."}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="profile-edit-btn inline-flex items-center justify-center rounded-full bg-[#F3F4F6] px-6 py-2.5 text-sm font-semibold text-[#1F2937] shadow-sm transition hover:bg-[#E5E7EB]"
                  >
                    Edit Profile
                  </button>
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="profile-card rounded-[24px] border border-white/70 bg-white/80 px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out">
                  <h3 className="profile-section-title mb-5 text-xl font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                    Account Summary
                  </h3>
                  <dl className="profile-section-body space-y-4 text-[#4B5563] transition-colors duration-200 ease-out dark:text-[#a7b7d0]">
                    <div>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF] dark:text-[#7f90b0]">Email</dt>
                      <dd className="mt-1 text-base font-medium text-[#1F2937] dark:text-[#e6edf3]">{user?.email || ".........."}</dd>
                      <dd className="text-sm text-[#6B7280] dark:text-[#8fa3c3]">{user?.location || ".........."}</dd>
                    </div>
                    <div>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF] dark:text-[#7f90b0]">Role</dt>
                      <dd className="mt-1 text-base font-medium text-[#1F2937] dark:text-[#e6edf3]">{user?.role || ".........."}</dd>
                    </div>
                    <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-3">
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF] dark:text-[#7f90b0]">Joined</dt>
                      <dd className="text-base font-medium text-[#1F2937] dark:text-[#e6edf3]">
                        {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ".........."}
                      </dd>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF] dark:text-[#7f90b0]">Projects</dt>
                      <dd className="text-base font-medium text-[#1F2937] dark:text-[#e6edf3]">{myProjects.length}</dd>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF] dark:text-[#7f90b0]">Last Login</dt>
                      <dd className="text-base font-medium text-[#1F2937] dark:text-[#e6edf3]">
                        {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : ".........."}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="profile-card rounded-[24px] border border-white/70 bg-white/80 px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out">
                  <h3 className="profile-section-title mb-5 text-xl font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                    Settings
                  </h3>
                  <ul className="profile-settings space-y-4 text-[#1F2937] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                    {accountSettings.map((item) => {
                      const isLogout = item === "Log Out";
                      return (
                        <li key={item}>
                          <button
                            type="button"
                            onClick={() => handleSettingAction(item)}
                            className={`profile-setting-btn flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                              isLogout
                                ? "profile-setting-btn--danger bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FCA5A5]"
                                : "profile-setting-btn--neutral bg-[#F9FAFB] text-[#1F2937] hover:bg-[#E5E7EB]"
                            }`}
                          >
                            <span>{item}</span>
                            <span aria-hidden="true" className="profile-setting-caret text-[#9CA3AF]">
                              {isLogout ? "⟶" : "›"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="profile-card profile-card--muted rounded-[24px] border border-white/70 bg-white/85 px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out">
                  <header className="mb-4 flex items-center justify-between">
                    <h3 className="profile-section-title text-xl font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                      My Projects
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate("/projects", { state: { filter: "mine" } })}
                      className="profile-link text-sm font-semibold text-[#3E6DCC] transition hover:underline dark:text-[#7da8ff]"
                    >
                      View all
                    </button>
                  </header>
                  {myProjects.length === 0 ? (
                    <p className="profile-empty text-sm text-[#6B7280] dark:text-[#8fa3c3]">
                      Create a presentation to see it appear here.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {myProjects.map((project) => (
                        <li
                          key={project.id}
                          className="profile-item-card flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition-colors duration-200 ease-out"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#1F2937] dark:text-[#e6edf3]">{project.name}</p>
                            <p className="text-xs text-[#6B7280] dark:text-[#8fa3c3]">
                              Updated {new Date(project.updatedAt ?? project.createdAt ?? Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/editor/${project.id}`)}
                            className="profile-chip-btn rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-xs font-semibold text-[#3E6DCC] transition hover:bg-[#3E6DCC]/15 dark:bg-[rgba(89,132,212,0.2)] dark:text-[#9dbdff] dark:hover:bg-[rgba(89,132,212,0.25)]"
                          >
                            Open
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="profile-card profile-card--muted rounded-[24px] border border-white/70 bg-white/85 px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out">
                  <header className="mb-4 flex items-center justify-between">
                    <h3 className="profile-section-title text-xl font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                      My Templates
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate("/create")}
                      className="profile-link text-sm font-semibold text-[#3E6DCC] transition hover:underline dark:text-[#7da8ff]"
                    >
                      Go to studio
                    </button>
                  </header>
                  {myTemplates.length === 0 ? (
                    <p className="profile-empty text-sm text-[#6B7280] dark:text-[#8fa3c3]">
                      Save custom layouts from the editor and they&apos;ll be listed here.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {myTemplates.map((template) => (
                        <li
                          key={template.id}
                          className="profile-item-card rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition-colors duration-200 ease-out"
                        >
                          <p className="text-sm font-semibold text-[#1F2937] dark:text-[#e6edf3]">{template.name}</p>
                          <p className="text-xs text-[#6B7280] dark:text-[#8fa3c3]">
                            {template.category} • Updated {new Date(template.updatedAt ?? Date.now()).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <section className="profile-card profile-card--muted rounded-[24px] border border-white/70 bg-white/85 px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out">
                <header className="mb-4 flex items-center justify-between">
                  <h3 className="profile-section-title text-xl font-semibold text-[#111827] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
                    Teams you created
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate("/teams/new")}
                    className="profile-link text-sm font-semibold text-[#3E6DCC] transition hover:underline dark:text-[#7da8ff]"
                  >
                    New team
                  </button>
                </header>
                {myTeams.length === 0 ? (
                  <p className="profile-empty text-sm text-[#6B7280] dark:text-[#8fa3c3]">
                    You haven&apos;t created any teams yet. Start by setting one up.
                  </p>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {myTeams.map((team) => (
                      <li
                        key={team.id}
                        className="profile-item-card flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition-colors duration-200 ease-out"
                      >
                        <span className="text-sm font-semibold text-[#1F2937] dark:text-[#e6edf3]">{team.name}</span>
                        <p className="text-xs text-[#6B7280] dark:text-[#8fa3c3]">
                          {team.members?.length ?? 0} members • Created {new Date(team.createdAt ?? Date.now()).toLocaleDateString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/teams/${team.id}`)}
                          className="profile-chip-btn self-start rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-xs font-semibold text-[#3E6DCC] transition hover:bg-[#3E6DCC]/15 dark:bg-[rgba(89,132,212,0.2)] dark:text-[#9dbdff] dark:hover:bg-[rgba(89,132,212,0.25)]"
                        >
                          View team
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


