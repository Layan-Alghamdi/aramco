import React from "react";
import { useNavigate } from "react-router-dom";

export default function TeamHeader({ team }) {
  const navigate = useNavigate();

  if (!team) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {team.avatarUrl ? (
          <img
            src={team.avatarUrl}
            alt={`${team.name} avatar`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E0E7FF] text-xl font-semibold text-[#1B1533]">
            {team.name
              .split(" ")
              .map((part) => part.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase() || "T"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{team.name}</h1>
          <p className="text-sm text-[#6B7280]">{team.members?.length ?? 0} members</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(`/teams/${team.id}/edit`)}
        className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
      >
        Edit team
      </button>
    </div>
  );
}


