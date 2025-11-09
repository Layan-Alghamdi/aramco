import React from "react";
import { Link } from "react-router-dom";

function TeamAvatar({ avatarUrl, name }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={`${name} logo`} className="h-10 w-10 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0E7FF] text-sm font-semibold text-[#1B1533]">
      {initials || "T"}
    </div>
  );
}

export default function TeamsGrid({ teams }) {
  if (!teams || teams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white/70 px-4 py-6 text-center text-sm text-[#6B7280]">
        No teams yet — create your first team.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {teams.map((team) => (
        <Link
          key={team.id}
          to={`/teams/${team.id}`}
          className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <TeamAvatar avatarUrl={team.avatarUrl} name={team.name} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#111827]">{team.name}</span>
            <span className="text-xs text-[#6B7280]">{team.members?.length ?? 0} members</span>
          </div>
        </Link>
      ))}
    </div>
  );
}


