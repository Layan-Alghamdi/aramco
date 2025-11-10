import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const gradientBackground =
  "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)";

const strengthLabels = ["Weak", "Medium", "Strong"];

function getStrengthScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z]/.test(password)) score += 1;
  return score;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const strengthScore = useMemo(() => getStrengthScore(newPassword), [newPassword]);
  const activeStrength = newPassword ? strengthLabels[Math.min(strengthScore, strengthLabels.length - 1)] : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (typeof window === "undefined") {
      setError("Password updates are not available in this environment.");
      return;
    }

    const storedPassword = window.localStorage.getItem("userPassword") || "";

    if (!storedPassword) {
      setError("No account password found. Please log out and log in again.");
      return;
    }

    if (currentPassword !== storedPassword) {
      setError("Current password is incorrect.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setIsSaving(true);
    window.localStorage.setItem("userPassword", newPassword);
    setIsSaving(false);
    setStatus("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]">
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: gradientBackground }}
        />

        <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-12">
          <header className="flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[540px] rounded-[28px] border border-white/70 bg-white/85 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)] space-y-8"
            >
              <div className="space-y-2 text-[#1F2937]">
                <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
                <p className="text-sm text-[#6B7280]">Update your password to keep your account secure.</p>
              </div>

              <div className="space-y-5">
                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-[#4B5563]">Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#111827] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    placeholder="Enter current password"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-[#4B5563]">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#111827] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    placeholder="Enter new password"
                  />
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    {strengthLabels.map((label, index) => (
                      <span key={label} className={activeStrength === label ? "text-[#2563EB]" : "text-[#9CA3AF]"}>
                        {label}
                      </span>
                    ))}
                  </div>
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-[#4B5563]">Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#111827] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    placeholder="Re-enter new password"
                  />
                </label>
              </div>

              <p className="text-sm text-[#6B7280]">Make sure your new password is at least 8 characters long.</p>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>

              {status && (
                <div className="rounded-2xl bg-[#ECFDF5] px-4 py-3 text-sm font-medium text-[#047857]">{status}</div>
              )}
              {error && (
                <div className="rounded-2xl bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">{error}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


