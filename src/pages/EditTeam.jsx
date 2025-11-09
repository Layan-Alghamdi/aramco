import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";
import TeamForm from "@/components/TeamForm";
import Toast from "@/components/Toast";
import useTeams from "@/hooks/useTeams";
import { updateTeam } from "@/lib/teamsStore";

const gradientStyle = {
  background:
    "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
};

export default function EditTeam() {
  const { teamId } = useParams();
  const teams = useTeams();
  const team = useMemo(() => teams.find((item) => item.id === teamId), [teams, teamId]);
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  if (!team) {
    return (
      <>
        <SharedHeader />
        <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
          <section className="rounded-[28px] border border-dashed border-[#E5E7EB] bg-white/60 px-10 py-16 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#111827]">Team not found</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              The team you are looking for could not be located.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 inline-flex items-center rounded-full bg-[#1B1533] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
            >
              Back to dashboard
            </button>
          </section>
        </main>
      </>
    );
  }

  const owner = team.members.find((member) => member.role === "Owner");
  const invites = team.members
    .filter((member) => member.role !== "Owner")
    .map((member) => ({
      id: member.id,
      email: member.email,
      role: member.role,
      status: member.status
    }));

  const handleSubmit = ({ name, description, avatarUrl, members }) => {
    const inviteMembers = members.map((member) => ({
      ...member,
      status: member.status ?? "Invited"
    }));
    const mergedMembers = owner
      ? [owner, ...inviteMembers]
      : inviteMembers;
    updateTeam(team.id, {
      name,
      description,
      avatarUrl,
      members: mergedMembers
    });
    showToast("Team updated");
    navigate(`/teams/${team.id}`);
  };

  return (
    <>
      <SharedHeader />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
        <section className="relative overflow-hidden rounded-[28px] min-h-[520px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={gradientStyle} />
          <div className="relative z-10 flex justify-center px-6 py-10 md:px-14">
            <div className="w-full max-w-[640px]">
              <h1 className="text-3xl font-extrabold text-[#0A0A0A]">Edit team</h1>
              <p className="mt-2 text-sm text-[#4B5563]">Update your team name, description, logo, and invites.</p>
              <div className="mt-8">
                <TeamForm
                  initialName={team.name}
                  initialDescription={team.description}
                  initialAvatarUrl={team.avatarUrl}
                  initialMembers={invites}
                  submitLabel="Save changes"
                  onSubmit={handleSubmit}
                  onCancel={() => navigate(`/teams/${team.id}`)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Toast message={toast} />
    </>
  );
}


