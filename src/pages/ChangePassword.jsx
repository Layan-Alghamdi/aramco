import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const gradientBackground =
  "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)";

const SESSION_DURATION_MS = 5 * 60 * 1000;

const passwordStrengthLevels = [
  { label: "Weak", minScore: 0 },
  { label: "Medium", minScore: 2 },
  { label: "Strong", minScore: 4 }
];

function evaluatePasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

async function hashString(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createSession() {
  const token = window.crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  window.localStorage.setItem("sessionToken", token);
  window.localStorage.setItem("sessionExpiry", String(expiresAt));
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionValid, setSessionValid] = useState(false);
  const [storedPasswordHash, setStoredPasswordHash] = useState("");

  const strengthScore = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);
  const activeStrength = useMemo(() => {
    if (!newPassword) return null;

    if (strengthScore >= 4) return "Strong";
    if (strengthScore >= 2) return "Medium";
    return "Weak";
  }, [newPassword, strengthScore]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkSession = () => {
      const hash = window.localStorage.getItem("userPasswordHash") ?? "";
      setStoredPasswordHash(hash);

      const expiry = Number(window.localStorage.getItem("sessionExpiry") || "0");
      const hasValidSession = Boolean(expiry) && Date.now() < expiry && Boolean(hash);

      setSessionValid((prev) => {
        if (prev && !hasValidSession) {
          setCurrentPassword("");
        }
        return hasValidSession;
      });
    };

    checkSession();
    const intervalId = window.setInterval(checkSession, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const isSaveDisabled = !newPassword || !confirmPassword || (!sessionValid && !currentPassword);

  useEffect(() => {
    setErrorMessage("");
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (typeof window === "undefined") {
      setErrorMessage("Password update is unavailable in this environment.");
      setStatusMessage("");
      return;
    }

    const storedHash = window.localStorage.getItem("userPasswordHash") ?? "";
    const expiry = Number(window.localStorage.getItem("sessionExpiry") || "0");
    const sessionStillValid = Boolean(expiry) && Date.now() < expiry;

    if (!storedHash) {
      setErrorMessage("No password is associated with this account. Please log out and log in again.");
      setStatusMessage("");
      setSessionValid(false);
      return;
    }

    if (!sessionStillValid) {
      setSessionValid(false);
      if (!currentPassword) {
        setErrorMessage("Session expired. Please enter your current password to continue.");
        setStatusMessage("");
        return;
      }

      const currentHash = await hashString(currentPassword);
      if (currentHash !== storedHash) {
        setErrorMessage("Current password is incorrect.");
        setStatusMessage("");
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      setStatusMessage("");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      setStatusMessage("");
      return;
    }

    if (strengthScore < 2) {
      setErrorMessage("New password is too weak. Try adding uppercase letters, numbers, or symbols.");
      setStatusMessage("");
      return;
    }

    const newPasswordHash = await hashString(newPassword);

    if (newPasswordHash === storedHash) {
      setErrorMessage("New password must be different from the current password.");
      setStatusMessage("");
      return;
    }

    window.localStorage.setItem("userPasswordHash", newPasswordHash);
    createSession();

    setStoredPasswordHash(newPasswordHash);
    setSessionValid(true);
    setErrorMessage("");
    setStatusMessage("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const renderStrengthLabel = (label) => {
    const isActive = activeStrength === label;
    return (
      <span
        key={label}
        className={`text-sm font-semibold transition ${
          isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"
        }`}
      >
        {label}
      </span>
    );
  };

  const renderToggleButton = (showValue, toggle) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition"
      aria-label={showValue ? "Hide password" : "Show password"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {showValue ? (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 3l18 18M10.477 10.481a3 3 0 104.242 4.241"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.88 5.083A10.442 10.442 0 0112 5c5.523 0 10 4.477 10 10 0 1.131-.198 2.217-.561 3.221M15 15a3 3 0 01-3 3m0-0c-5.523 0-10-4.477-10-10 0-1.131.198-2.217.561-3.221"
            />
          </>
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7z"
          />
        )}
      </svg>
    </button>
  );

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
              className="w-full max-w-[540px] rounded-[28px] border border-white/70 bg-white/85 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)] space-y-8"
              onSubmit={handleSave}
            >
              <div className="space-y-2 text-[#1F2937]">
                <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#4B5563]">Current password</label>
                  <div className="relative">
                    <input
                      type={sessionValid ? "password" : showCurrent ? "text" : "password"}
                      value={sessionValid ? "••••••••" : currentPassword}
                      onChange={(event) => {
                        if (sessionValid) return;
                        setCurrentPassword(event.target.value);
                      }}
                      readOnly={sessionValid}
                      className={`w-full h-12 rounded-2xl border border-[#E2E8F0] px-4 pr-10 text-sm text-[#111827] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                        sessionValid ? "bg-[#F8FAFC]" : "bg-white"
                      }`}
                      placeholder={sessionValid ? "Verified via session" : "Enter current password"}
                    />
                    {!sessionValid && renderToggleButton(showCurrent, () => setShowCurrent((prev) => !prev))}
                  </div>
                  {sessionValid && (
                    <p className="text-xs font-medium text-[#16A34A]">Verified via active session.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#4B5563]">New password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full h-12 rounded-2xl border border-[#E2E8F0] bg-white px-4 pr-10 text-sm text-[#111827] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="Enter new password"
                    />
                    {renderToggleButton(showNew, () => setShowNew((prev) => !prev))}
                  </div>
                  <div className="flex items-center gap-4">
                    {passwordStrengthLevels.map(({ label }) => renderStrengthLabel(label))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#4B5563]">Confirm new password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full h-12 rounded-2xl border border-[#E2E8F0] bg-white px-4 pr-10 text-sm text-[#111827] shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="Re-enter new password"
                    />
                    {renderToggleButton(showConfirm, () => setShowConfirm((prev) => !prev))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#6B7280]">Make sure your new password is at least 8 characters long.</p>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSaveDisabled}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Save Changes
                </button>
              </div>

              {errorMessage && (
                <div className="rounded-2xl bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                  {errorMessage}
                </div>
              )}
              {statusMessage && (
                <div className="rounded-2xl bg-[#ECFDF5] px-4 py-3 text-sm font-medium text-[#047857]">
                  {statusMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


