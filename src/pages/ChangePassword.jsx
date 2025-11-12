import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const backgroundStyle = {
  background: "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)"
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    resetMessages();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSuccess("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <section
      className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-['Poppins',ui-sans-serif]"
      style={backgroundStyle}
    >
      <div className="w-full max-w-[720px] rounded-[30px] bg-white shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
        <div className="px-8 sm:px-12 py-12 space-y-10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-[#F9FAFB]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <span className="hidden sm:block w-16" aria-hidden="true" />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">Change Password</h1>
            <p className="text-sm text-[#6B7280]">Update your account password below.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-semibold text-[#1F2937]">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(event) => {
                  resetMessages();
                  setCurrentPassword(event.target.value);
                }}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#1F2937] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3E6DCC]"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-semibold text-[#1F2937]">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => {
                  resetMessages();
                  setNewPassword(event.target.value);
                }}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#1F2937] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3E6DCC]"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-[#1F2937]">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => {
                  resetMessages();
                  setConfirmPassword(event.target.value);
                }}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#1F2937] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3E6DCC]"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5] px-4 py-3 text-sm font-medium text-[#047857]">
                {success}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#1B1533] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(17,24,39,0.18)] transition hover:opacity-95"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-6 py-3 text-sm font-semibold text-[#4B5563] shadow-sm transition hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


