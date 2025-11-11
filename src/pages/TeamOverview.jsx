import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";
import TeamHeader from "@/components/TeamHeader";
import Toast from "@/components/Toast";
import useTeams from "@/hooks/useTeams";
import { deleteTeam, updateTeam } from "@/lib/teamsStore";

const gradientStyle = {
  background: "#FFFFFF"
};

const formatDate = (iso) => {
  if (!iso) return "–";
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const createInviteLink = (teamId) =>
  `app://teams/${teamId}/invite?token=${Math.random().toString(36).slice(2, 10)}`;

export default function TeamOverview() {
  const { teamId } = useParams();
  const teams = useTeams();
  const team = useMemo(() => teams.find((item) => item.id === teamId), [teams, teamId]);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [toast, setToast] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  if (!team) {
    return (
      <>
        <SharedHeader />
        <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
          <section className="rounded-[28px] border border-dashed border-[#E5E7EB] bg-white/60 px-10 py-16 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#111827]">Team not found</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              The team you are looking for does not exist or was removed.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center rounded-full bg-[#1B1533] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
            >
              Back to dashboard
            </Link>
          </section>
        </main>
      </>
    );
  }

  const owner = team.members.find((member) => member.role === "Owner");

  const handleRoleChange = (memberId, role) => {
    const updatedMembers = team.members.map((member) =>
      member.id === memberId ? { ...member, role } : member
    );
    updateTeam(team.id, { members: updatedMembers });
    showToast("Role updated");
  };

  const handleRemoveMember = (memberId) => {
    const updatedMembers = team.members.filter((member) => member.id !== memberId);
    updateTeam(team.id, { members: updatedMembers });
    showToast("Member removed");
  };

  const handleInviteSubmit = (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember = {
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `member-${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "Invited"
    };
    updateTeam(team.id, { members: [...team.members, newMember] });
    setInviteEmail("");
    setInviteRole("Member");
    setShowInvitePanel(false);
    showToast("Invitation sent");
  };

  const handleCopyInvite = async () => {
    const link = createInviteLink(team.id);
    try {
      await navigator.clipboard.writeText(link);
      showToast("Invite link copied");
    } catch (error) {
      console.error(error);
      showToast("Unable to copy link");
    }
  };

  const handleDeleteTeam = () => {
    deleteTeam(team.id);
    setShowDeleteModal(false);
    navigate("/dashboard", { state: { toast: "Team deleted" } });
  };

  return (
    <>
      <SharedHeader />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
        <section className="relative overflow-hidden rounded-[28px] min-h-[520px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={gradientStyle} />
          <div className="relative z-10 px-6 py-10 md:px-14">
            <TeamHeader team={team} />

            <div className="mt-8 flex flex-wrap gap-3 rounded-full bg-white/60 p-1 text-sm font-semibold text-[#6B7280]">
              {["overview", "members", "settings"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 capitalize transition ${
                    activeTab === tab ? "bg-white text-[#1B1533] shadow-sm" : ""
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-white/75 p-6 shadow">
                  <h2 className="text-sm font-semibold text-[#111827]">Team details</h2>
                  <dl className="mt-4 space-y-2 text-sm text-[#4B5563]">
                    <div className="flex justify-between">
                      <dt>Created</dt>
                      <dd>{formatDate(team.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Members</dt>
                      <dd>{team.members.length}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-white/75 p-6 shadow lg:col-span-2">
                  <h2 className="text-sm font-semibold text-[#111827]">Quick actions</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setShowInvitePanel(true)}
                      className="inline-flex items-center rounded-full bg-[#1B1533] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                    >
                      Invite member
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                    >
                      Copy invite link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="mt-8 rounded-2xl bg-white/80 p-6 shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#111827]">Members</h2>
                  <button
                    type="button"
                    onClick={() => setShowInvitePanel(true)}
                    className="inline-flex items-center rounded-full bg-[#1B1533] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                  >
                    Invite member
                  </button>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-[#6B7280]">
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] bg-white/60">
                      {team.members.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-3 font-medium text-[#111827]">{member.email}</td>
                          <td className="px-4 py-3">
                            {member.role === "Owner" ? (
                              <span className="rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-semibold text-[#1B1533]">
                                Owner
                              </span>
                            ) : (
                              <select
                                value={member.role}
                                onChange={(event) => handleRoleChange(member.id, event.target.value)}
                                className="rounded-full border border-[#D1D5DB] bg-white px-3 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                              >
                                <option value="Admin">Admin</option>
                                <option value="Member">Member</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#4B5563]">
                              {member.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {member.role !== "Owner" && (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => showToast("Invite resent")}
                                  className="text-xs font-semibold text-[#1B1533] underline-offset-2 hover:underline"
                                >
                                  Resend invite
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-xs font-semibold text-red-500 underline-offset-2 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="mt-8 rounded-2xl bg-white/80 p-6 shadow">
                <h2 className="text-lg font-semibold text-[#DC2626]">Danger zone</h2>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Deleting a team will remove all members and data associated with it.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-6 inline-flex items-center rounded-full border border-red-200 bg-white px-6 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition"
                >
                  Delete team
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {showInvitePanel && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowInvitePanel(false)} aria-hidden="true" />
          <aside className="w-full max-w-md bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-[#111827]">Invite member</h2>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleInviteSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#6B7280]" htmlFor="invite-email">
                  Email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="person@company.com"
                  className="rounded-2xl border border-[#D1D5DB] px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#6B7280]" htmlFor="invite-role">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className="rounded-2xl border border-[#D1D5DB] bg-white px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvitePanel(false)}
                  className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[#1B1533] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                >
                  Send invite
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-[#111827]">Delete team</h2>
            <p className="mt-3 text-sm text-[#6B7280]">
              Are you sure you want to delete this team? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                className="inline-flex items-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </>
  );
}


