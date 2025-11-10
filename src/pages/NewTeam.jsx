import React from "react";
import { useNavigate } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";
import TeamForm from "@/components/TeamForm";
import { createTeam } from "@/lib/teamsStore";
import useCurrentUser from "@/hooks/useCurrentUser";
import { recordTeamForUser } from "@/lib/usersStore";

const gradientStyle = {
  background:
    "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
};

const createId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `team-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function NewTeam() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const ownerEmail = user?.email ?? "you@aramatrix.app";

  const handleSubmit = ({ name, description, avatarUrl, members }) => {
    const owner = {
      id: user?.id ?? createId(),
      email: ownerEmail,
      name: user?.name ?? "Team Owner",
      role: "Owner",
      status: "Active"
    };
    const invites = members.map((member) => ({
      ...member,
      status: member.status ?? "Invited"
    }));
    const team = createTeam({
      name,
      description,
      avatarUrl,
      members: [owner, ...invites],
      createdById: owner.id,
      createdByName: owner.name
    });
    if (user?.id) {
      recordTeamForUser(user.id, team.id);
    }
    navigate(`/teams/${team.id}`, { state: { toast: "Team created" } });
  };

  return (
    <>
      <SharedHeader />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
        <section className="relative overflow-hidden rounded-[28px] min-h-[520px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={gradientStyle} />
          <div className="relative z-10 flex justify-center px-6 py-10 md:px-14">
            <div className="w-full max-w-[640px]">
              <h1 className="text-3xl font-extrabold text-[#0A0A0A]">Create a new team</h1>
              <p className="mt-2 text-sm text-[#4B5563]">
                Set your team details, upload a logo, and invite teammates to get started.
              </p>
              <div className="mt-8">
                <TeamForm
                  submitLabel="Create team"
                  onSubmit={handleSubmit}
                  onCancel={() => navigate("/dashboard")}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


