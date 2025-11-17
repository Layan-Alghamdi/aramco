import React, { useRef } from "react";

const placeholderColor = "#e5e7eb";

export default function AvatarUploader({ value, onChange, label = "Team avatar" }) {
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof onChange === "function") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="avatar-circle flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-[#D1D5DB] bg-white overflow-hidden"
        aria-hidden="true"
        style={{
          backgroundColor: value ? "transparent" : placeholderColor
        }}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-[#6B7280]">Logo</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#374151]" htmlFor="team-avatar-input">
          {label}
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="glow-button inline-flex items-center rounded-full bg-[#1B1533] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
          >
            Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="glow-button inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#1B1533] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id="team-avatar-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-[#6B7280]">JPG, PNG, or SVG. 1MB max.</p>
      </div>
    </div>
  );
}


