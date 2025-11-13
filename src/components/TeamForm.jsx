import React, { useMemo, useState } from "react";
import AvatarUploader from "@/components/AvatarUploader";
import MembersEditor, { validateEmail } from "@/components/MembersEditor";

const MIN_NAME = 3;
const MAX_NAME = 40;
const MAX_DESCRIPTION = 200;

const normalizeMembers = (members) =>
  members.map((member) => ({
    id: member.id,
    email: member.email.trim(),
    role: member.role,
    status: member.status ?? "Invited"
  }));

const createMemberId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `member-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createInitialMembers = (members) => {
  if (members && members.length > 0) {
    return members.map((member) => ({
      id: member.id,
      email: member.email,
      role: member.role,
      status: member.status ?? "Invited"
    }));
  }
  return [
    {
      id: createMemberId(),
      email: "",
      role: "Member",
      status: "Invited"
    }
  ];
};

export default function TeamForm({
  initialName = "",
  initialDescription = "",
  initialAvatarUrl = "",
  initialMembers = [],
  submitLabel = "Create team",
  onSubmit,
  onCancel
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [members, setMembers] = useState(() => createInitialMembers(initialMembers));
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length >= MIN_NAME && trimmedName.length <= MAX_NAME;

  const invites = useMemo(() => normalizeMembers(members), [members]);

  const hasInvalidEmails = invites.some((member) => member.email && !validateEmail(member.email));

  const filteredInvites = invites.filter((member) => member.email.length > 0);

  const isSubmitDisabled = !nameValid || hasInvalidEmails;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (isSubmitDisabled) return;
    if (typeof onSubmit === "function") {
      onSubmit({
        name: trimmedName,
        description: description.trim(),
        avatarUrl,
        members: filteredInvites
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 rounded-[28px] border border-white/40 bg-white/75 p-8 shadow-xl backdrop-blur transition-[background,border,box-shadow,color] duration-500 ease-out dark:bg-transparent dark:border-transparent dark:shadow-none"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="team-name" className="text-sm font-semibold text-[#111827]">
            Team name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setTouched(true)}
            minLength={MIN_NAME}
            maxLength={MAX_NAME}
            placeholder="Product Design"
            className={`rounded-2xl border px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              touched && !nameValid ? "border-red-300" : "border-[#D1D5DB]"
            }`}
            required
          />
          <div className="flex justify-between text-xs text-[#6B7280]">
            <span>{MIN_NAME}-{MAX_NAME} characters</span>
            <span>{trimmedName.length}/{MAX_NAME}</span>
          </div>
          {touched && !nameValid && (
            <span className="text-xs text-red-500">Team name must be between 3 and 40 characters.</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="team-description" className="text-sm font-semibold text-[#111827]">
            Description <span className="text-xs text-[#9CA3AF]">(optional)</span>
          </label>
          <textarea
            id="team-description"
            value={description}
            onChange={(event) => {
              if (event.target.value.length <= MAX_DESCRIPTION) {
                setDescription(event.target.value);
              }
            }}
            placeholder="Describe your team’s focus or mission."
            rows={3}
            maxLength={MAX_DESCRIPTION}
            className="rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
          <div className="flex justify-end text-xs text-[#6B7280]">
            <span>{description.length}/{MAX_DESCRIPTION}</span>
          </div>
        </div>

        <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />
      </div>

      <MembersEditor members={members} onChange={setMembers} />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="glow-btn inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-5 py-2 text-sm font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="glow-btn primary inline-flex items-center rounded-full bg-[#1B1533] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}


