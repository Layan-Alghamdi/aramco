import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import { getStoredTheme, setTheme } from "../utils/theme";

const emptyProfile = {
  name: "",
  role: "",
  department: "",
  employeeId: "",
  email: "",
  companySite: "",
  joined: "",
  projects: "",
  lastLogin: ""
};

function getInitials(value) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [avatar, setAvatar] = useState("");
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [themePreference, setThemePreference] = useState("system");
  const firstThemeButtonRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setProfile({
      name: window.localStorage.getItem("userName")?.trim() || "",
      role: window.localStorage.getItem("userRole")?.trim() || "",
      department: window.localStorage.getItem("userDepartment")?.trim() || "",
      employeeId: window.localStorage.getItem("userEmployeeId")?.trim() || "",
      email: window.localStorage.getItem("userEmail")?.trim() || "",
      companySite: window.localStorage.getItem("userCompany")?.trim() || "",
      joined: window.localStorage.getItem("userJoined")?.trim() || "",
      projects: window.localStorage.getItem("userProjects")?.trim() || "",
      lastLogin: window.localStorage.getItem("userLastLogin")?.trim() || ""
    });
    setAvatar(window.localStorage.getItem("userAvatar") || "");
  }, []);

  useEffect(() => {
    setThemePreference(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!isThemeModalOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setThemeModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    if (firstThemeButtonRef.current) {
      firstThemeButtonRef.current.focus();
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isThemeModalOpen]);

  const themeOptions = useMemo(
    () => [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System" }
    ],
    []
  );

  const themeLabel = useMemo(() => {
    switch (themePreference) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "System";
    }
  }, [themePreference]);

  const initials = useMemo(() => getInitials(profile.name), [profile.name]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("isAuth");
    }
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleChangePassword = () => {
    navigate("/profile/password");
  };

  const openThemeModal = () => {
    setThemePreference(getStoredTheme());
    setThemeModalOpen(true);
  };

  const handleThemeSelect = (value) => {
    setThemePreference(value);
    setTheme(value);
  };

  const closeThemeModal = () => {
    setThemeModalOpen(false);
  };

  const settings = [
    {
      label: "Change Password",
      onClick: handleChangePassword,
      tone: "primary"
    },
    {
      label: "Notification Preferences",
      onClick: () => navigate("/profile/notifications"),
      tone: "neutral"
    },
    {
      label: `Theme: ${themeLabel}`,
      onClick: openThemeModal,
      tone: "neutral"
    },
    {
      label: "Log Out",
      onClick: handleLogout,
      tone: "danger"
    }
  ];

  return (
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]">
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)'
          }}
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
            <div className="w-full flex flex-col gap-8">
              <section className="mx-auto w-full max-w-[680px] rounded-[26px] border border-white/70 bg-white/80 backdrop-blur-sm px-10 py-8 shadow-[0_12px_50px_rgba(31,41,55,0.08)]">
                <div className="flex flex-col items-center gap-6 text-center">
                  {avatar ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/70 shadow-lg">
                      <img src={avatar} alt={profile.name || "Profile avatar"} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#2563EB] flex items-center justify-center text-white text-4xl font-semibold">
                      {initials || ""}
                    </div>
                  )}
                  <div className="space-y-3 w-full max-w-[360px] text-left">
                    <p className="text-base font-semibold text-[#111827]">
                      Name: <span className="font-normal text-[#4B5563]">{profile.name || ".........."}</span>
                    </p>
                    <p className="text-base font-semibold text-[#111827]">
                      Department: <span className="font-normal text-[#4B5563]">{profile.department || ".........."}</span>
                    </p>
                    <p className="text-base font-semibold text-[#111827]">
                      Employee ID: <span className="font-normal text-[#4B5563]">{profile.employeeId || ".........."}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="inline-flex items-center justify-center rounded-full bg-[#F3F4F6] px-6 py-2.5 text-sm font-semibold text-[#1F2937] shadow-sm transition hover:bg-[#E5E7EB]"
                  >
                    Edit Profile
                  </button>
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-[24px] border border-white/70 bg-white/80 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                  <h3 className="text-xl font-semibold text-[#111827] mb-5">Account Summary</h3>
                  <dl className="space-y-4 text-[#4B5563]">
                    <div>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Email</dt>
                      <dd className="mt-1 text-base font-medium text-[#1F2937]">{profile.email || ".........."}</dd>
                      <dd className="text-sm">{profile.companySite || ".........."}</dd>
                    </div>
                    <div>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Role</dt>
                      <dd className="mt-1 text-base font-medium text-[#1F2937]">{profile.role || ".........."}</dd>
                    </div>
                    <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-3">
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Joined</dt>
                      <dd className="text-base font-medium text-[#1F2937]">{profile.joined || ".........."}</dd>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Projects</dt>
                      <dd className="text-base font-medium text-[#1F2937]">{profile.projects || ".........."}</dd>
                      <dt className="text-sm uppercase tracking-wide text-[#9CA3AF]">Last Login</dt>
                      <dd className="text-base font-medium text-[#1F2937]">{profile.lastLogin || ".........."}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-[24px] border border-white/70 bg-white/80 backdrop-blur-sm px-8 py-7 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                  <h3 className="text-xl font-semibold text-[#111827] mb-5">Settings</h3>
                  <ul className="space-y-4 text-[#1F2937]">
                    {settings.map(({ label, onClick, tone }) => {
                      const isLogout = tone === "danger";
                      const isDisabled = !onClick;
                      return (
                        <li key={label}>
                          <button
                            type="button"
                            onClick={onClick}
                            disabled={isDisabled}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                              isLogout
                                ? "bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FCA5A5]"
                                : "bg-[#F9FAFB] text-[#1F2937] hover:bg-[#E5E7EB]"
                            }`}
                            style={isDisabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                          >
                            <span>{label}</span>
                            <span aria-hidden="true" className="text-[#9CA3AF]">
                              {isLogout ? "⟶" : "›"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            onClick={closeThemeModal}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-selector-title"
            className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-white/60 bg-white/95 px-8 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out dark:bg-[#0B1120]/95 dark:border-white/10"
          >
            <div className="flex items-start justify-between pb-4">
              <div>
                <h2 id="theme-selector-title" className="text-2xl font-semibold text-[#111827] dark:text-[#E2E8F0]">
                  Choose Theme
                </h2>
                <p className="mt-1 text-sm text-[#6B7280] dark:text-[#A5B4FC]">
                  Select the appearance that works best for you.
                </p>
              </div>
              <button
                type="button"
                onClick={closeThemeModal}
                className="ml-4 rounded-full bg-[#F3F4F6] p-2 text-[#4B5563] transition hover:bg-[#E5E7EB]"
                aria-label="Close theme selector"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid gap-3">
              {themeOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  ref={index === 0 ? firstThemeButtonRef : undefined}
                  aria-pressed={themePreference === option.value}
                  onClick={() => handleThemeSelect(option.value)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                    themePreference === option.value
                      ? "border-transparent bg-[#2563EB] text-white shadow-lg"
                      : "border-[#E2E8F0] bg-white/80 text-[#1F2937] hover:bg-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {themePreference === option.value && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-[#6B7280] dark:text-[#94A3B8]">
              The theme applies instantly and syncs with your device when set to System.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeThemeModal}
                className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


