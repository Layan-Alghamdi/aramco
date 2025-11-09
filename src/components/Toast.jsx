import React from "react";

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-[#1F2937] px-6 py-3 text-sm font-medium text-white shadow-xl"
    >
      {message}
    </div>
  );
}


