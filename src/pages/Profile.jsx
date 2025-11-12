import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useProjects } from "@/context/ProjectsContext";
import useTeams from "@/hooks/useTeams";
import { getTemplatesForUser, signOutUser } from "@/lib/usersStore";

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
        navigate("/profile/edit", { state: { focus: "theme" } });
        break;
      case "Log Out":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]" style={{ background: "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)" }}>
      <div className="w-full max-w-[1200px] rounded-[28px] bg-white shadow-[0_12px_50px_rgba(31,41,55,0.12)]">
        <div className="flex h-full flex-col px-10 pt-8 pb-12">
          <header className="flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <div className="w-full flex flex-col gap-8">
              <section className="mx-auto w-full max-w-[680px] rounded-[26px] border border-white/70 bg-white/80 backdrop-blur-sm px-10 py-8 shadow-[0_12px_50px_rgba(31,41,55,0.08)]">
                <div className="flex flex-col items-center gap-6 text-center">
                  {user?.avatarUrl ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/70 shadow-lg">
                      <img src={user.avatarUrl} alt={user.name || "Profile avatar"} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#2563EB] flex items-center justify-center text-white text-4xl font-semibold">
                      {initials || ""}
                    </div>
                  )}
                  <div className="space-y-3 w-full max-w-[360px] text-left">
                    <p className="text-base font-semibold text-[#111827]">
                      Name: <span className="font-normal text-[#4B5563]">{user?.name || ".........."}</span>
                    </p>
                    <p className="text-base font-semibold text-[#111827]">
                      Department: <span className="font-normal text-[#4B5563]">{user?.department || ".........."}</span>
                    </p>
                    <p className="text-base font-semibold text-[#111827]">
                      Role: <span className="font-normal text-[#4B5563]">{user?.role || ".........."}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="inline-flex items-center justify-center rounded-full bg-[#F3F4F6] px-6 py-2.5 text-sm font-semibold text-[#1F2937] shadow-sm transition hover:bg-[#E5E7EB]"
                  >
                    Edit Profile
                  </button>
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-[24px] border border-white/70 bg-white/80 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                  <h3 className="text-xl font-semibold text-[#111827] mb-5">Account Summary</h3>
                  <dl className="space-y-4 text-[#4B5563]">
                    <div>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Email</dt>
                      <dd className="mt-1 text-base font-medium text-[#1F2937]">{user?.email || ".........."}</dd>
                      <dd className="text-sm">{user?.location || ".........."}</dd>
                    </div>
                    <div>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Role</dt>
                      <dd className="mt-1 text-base font-medium text-[#1F2937]">{user?.role || ".........."}</dd>
                    </div>
                    <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-3">
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Joined</dt>
                      <dd className="text-base font-medium text-[#1F2937]">
                        {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ".........."}
                      </dd>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Projects</dt>
                      <dd className="text-base font-medium text-[#1F2937]">{myProjects.length}</dd>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Last Login</dt>
                      <dd className="text-base font-medium text-[#1F2937]">
                        {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : ".........."}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-[24px] border border-white/70 bg-white/80 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                  <h3 className="text-xl font-semibold text-[#111827] mb-5">Settings</h3>
                  <ul className="space-y-4 text-[#1F2937]">
                    {accountSettings.map((item) => {
                      const isLogout = item === "Log Out";
                      return (
                        <li key={item}>
                          <button
                            type="button"
                            onClick={() => handleSettingAction(item)}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                              isLogout ? "bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FCA5A5]" : "bg-[#F9FAFB] text-[#1F2937] hover:bg-[#E5E7EB]"
                            }`}
                          >
                            <span>{item}</span>
                            <span aria-hidden="true" className="text-[#9CA3AF]">
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
                <section className="rounded-[24px] border border-white/70 bg-white/85 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                  <header className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-[#111827]">My Projects</h3>
                    <button
                      type="button"
                      onClick={() => navigate("/projects", { state: { filter: "mine" } })}
                      className="text-sm font-semibold text-[#3E6DCC] hover:underline"
                    >
                      View all
                    </button>
                  </header>
                  {myProjects.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">
                      Create a presentation to see it appear here.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {myProjects.map((project) => (
                        <li key={project.id} className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
                          <div>
                            <p className="text-sm font-semibold text-[#1F2937]">{project.name}</p>
                            <p className="text-xs text-[#6B7280]">
                              Updated {new Date(project.updatedAt ?? project.createdAt ?? Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/editor/${project.id}`)}
                            className="rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-xs font-semibold text-[#3E6DCC] hover:bg-[#3E6DCC]/15"
                          >
                            Open
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-[24px] border border-white/70 bg-white/85 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                  <header className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-[#111827]">My Templates</h3>
                    <button
                      type="button"
                      onClick={() => navigate("/create")}
                      className="text-sm font-semibold text-[#3E6DCC] hover:underline"
                    >
                      Go to studio
                    </button>
                  </header>
                  {myTemplates.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">
                      Save custom layouts from the editor and they&apos;ll be listed here.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {myTemplates.map((template) => (
                        <li key={template.id} className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1F2937]">{template.name}</p>
                          <p className="text-xs text-[#6B7280]">
                            {template.category} • Updated {new Date(template.updatedAt ?? Date.now()).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <section className="rounded-[24px] border border-white/70 bg-white/85 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                <header className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#111827]">Teams you created</h3>
                  <button
                    type="button"
                    onClick={() => navigate("/teams/new")}
                    className="text-sm font-semibold text-[#3E6DCC] hover:underline"
                  >
                    New team
                  </button>
                </header>
                {myTeams.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">
                    You haven&apos;t created any teams yet. Start by setting one up.
                  </p>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {myTeams.map((team) => (
                      <li key={team.id} className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm flex flex-col gap-2">
                        <span className="text-sm font-semibold text-[#1F2937]">{team.name}</span>
                        <p className="text-xs text-[#6B7280]">
                          {team.members?.length ?? 0} members • Created {new Date(team.createdAt ?? Date.now()).toLocaleDateString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/teams/${team.id}`)}
                          className="self-start rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-xs font-semibold text-[#3E6DCC] hover:bg-[#3E6DCC]/15"
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


