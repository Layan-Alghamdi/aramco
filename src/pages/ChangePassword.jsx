import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useThemeMode from "@/hooks/useThemeMode";

const backgroundGradient = "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)";

const initialFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState({ type: null, message: "" });
  const themeMode = useThemeMode();
  const isDark = useMemo(() => themeMode === "dark", [themeMode]);
  useEffect(() => {
    document.body.classList.add("change-password-surface");
    return () => {
      document.body.classList.remove("change-password-surface");
      document.body.classList.remove("dark-change-password");
    };
  }, []);

  useEffect(() => {
    if (themeMode === "dark") {
      document.body.classList.add("dark-change-password");
    } else {
      document.body.classList.remove("dark-change-password");
    }
  }, [themeMode]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (status.type) {
      setStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setStatus({ type: "success", message: "Password updated successfully!" });
    setForm(initialFormState);
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <section
      className="change-password-shell min-h-screen w-full flex items-center justify-center px-6 py-12 font-['Poppins',ui-sans-serif] text-[#1E1E1E]"
      style={isDark ? undefined : { background: backgroundGradient }}
    >
      <div className="change-password-card w-full max-w-[640px] rounded-[28px] bg-white/85 backdrop-blur-sm shadow-[0_12px_50px_rgba(31,41,55,0.12)] border border-white/60">
        <div className="change-password-inner relative px-8 sm:px-12 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="change-password-back absolute left-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] shadow-sm transition hover:bg-[#F3F4F6]"
            aria-label="Back to profile"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div className="mt-8 flex flex-col items-center text-center gap-3">
            <h1 className="change-password-title text-3xl font-semibold text-[#0A0A0A]">Change Password</h1>
            <p className="change-password-description text-sm text-[#6B7280]">Update your account password below.</p>
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="change-password-label text-sm font-medium text-[#1F2937]">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={handleChange}
                className="change-password-input w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-base shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="change-password-label text-sm font-medium text-[#1F2937]">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange}
                className="change-password-input w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-base shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="change-password-label text-sm font-medium text-[#1F2937]">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="change-password-input w-full rounded-2xl border border-[#D8DEEA] bg-white px-4 py-3 text-base shadow-sm focus:border-[#3E6DCC] focus:ring-2 focus:ring-[#3E6DCC]/20 outline-none transition"
                required
              />
            </div>

            {status.type === "error" && (
              <p className="change-password-status change-password-status--error rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {status.message}
              </p>
            )}

            {status.type === "success" && (
              <p className="change-password-status change-password-status--success rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {status.message}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="change-password-cancel rounded-full border border-[#D1D5DB] bg-white px-6 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="change-password-save rounded-full bg-[#1B1533] px-7 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(27,21,51,0.25)] transition hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


