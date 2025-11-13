import React from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const createMemberId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `member-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function validateEmail(email) {
  return emailRegex.test(email.trim());
}

export default function MembersEditor({ members, onChange }) {
  const updateMember = (id, field, value) => {
    if (!onChange) return;
    onChange(
      members.map((member) =>
        member.id === id
          ? {
              ...member,
              [field]: field === "email" ? value : value
            }
          : member
      )
    );
  };

  const handleRemove = (id) => {
    if (!onChange) return;
    if (members.length <= 1) return;
    onChange(members.filter((member) => member.id !== id));
  };

  const handleAdd = () => {
    if (!onChange) return;
    const newMember = {
      id: createMemberId(),
      email: "",
      role: "Member",
      status: "Invited"
    };
    onChange([...members, newMember]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#111827]">Invite members</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="glow-button inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
        >
          Add another
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {members.map((member, index) => {
          const emailValid = member.email ? validateEmail(member.email) : true;
          return (
            <div
              key={member.id}
              className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white/70 px-4 py-4 md:grid-cols-[1fr_minmax(120px,160px)_auto]"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#6B7280]" htmlFor={`member-email-${member.id}`}>
                  Member email
                </label>
                <input
                  id={`member-email-${member.id}`}
                  type="email"
                  value={member.email}
                  placeholder="name@company.com"
                  onChange={(event) => updateMember(member.id, "email", event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    emailValid ? "border-[#D1D5DB]" : "border-red-300"
                  }`}
                />
                {!emailValid && (
                  <span className="text-xs text-red-500">Enter a valid email address.</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#6B7280]" htmlFor={`member-role-${member.id}`}>
                  Role
                </label>
                <select
                  id={`member-role-${member.id}`}
                  value={member.role}
                  onChange={(event) => updateMember(member.id, "role", event.target.value)}
                  className="rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <div className="flex items-center gap-2">
                  {member.status && (
                    <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#4B5563]">
                      {member.status}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="glow-button inline-flex items-center rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition disabled:opacity-50"
                    disabled={members.length <= 1}
                    aria-label={members.length <= 1 ? "Cannot remove the last member row" : "Remove member row"}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


