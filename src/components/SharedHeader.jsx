import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { signOutUser } from "@/lib/usersStore";
import useThemeMode from "@/hooks/useThemeMode";

const navItems = [
  { to: "/", label: "Home", ariaLabel: "Go to Home" },
  { to: "/notifications", label: "Notification", ariaLabel: "Go to Notifications" },
  { to: "/features", label: "Features", ariaLabel: "Go to Features" },
  { to: "/about", label: "About", ariaLabel: "Go to About" }
];

function UserMenu({ tone = "default" }) {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const isNotificationsDark = tone === "notifications-dark";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleNavigate = (path, options) => () => {
    setOpen(false);
    navigate(path, options);
  };

  const handleLogout = () => {
    setOpen(false);
    signOutUser();
    navigate("/login");
  };

  return (
    <div className={`relative ${isNotificationsDark ? "notifications-profile" : ""}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          isNotificationsDark
            ? "notifications-profile-trigger flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(97,166,255,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(8,16,32,0.35)]"
            : "flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        }
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "Profile"}
            className={`h-8 w-8 rounded-full object-cover ${isNotificationsDark ? "ring-1 ring-[rgba(255,255,255,0.14)]" : ""}`}
          />
        ) : (
          <span
            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
              isNotificationsDark
                ? "bg-[#1F2A40] text-white"
                : "bg-[#3E6DCC] text-white"
            }`}
          >
            {initials}
          </span>
        )}
        <span className={`hidden text-left sm:block ${isNotificationsDark ? "notifications-profile-copy" : ""}`}>
          <span className={`block text-xs ${isNotificationsDark ? "text-[rgba(188,208,239,0.72)]" : "text-[#6B7280]"}`}>
            {user?.role ?? "Collaborator"}
          </span>
          <span
            className={`block text-sm font-semibold leading-tight ${
              isNotificationsDark ? "text-[rgba(230,237,249,0.95)]" : "text-[#1F2937]"
            }`}
          >
            {user?.name ?? "Guest"}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isNotificationsDark ? "text-[rgba(199,214,239,0.7)]" : "text-[#6B7280]"} ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.063l3.71-3.832a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0l-4.25-4.39a.75.75 0 0 1 .02-1.061Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div
          className={
            isNotificationsDark
              ? "notifications-profile-menu absolute right-0 z-30 mt-3 w-64 rounded-2xl border px-3 py-3 shadow-[0_24px_70px_rgba(2,11,28,0.65)] backdrop-blur-[22px]"
              : "absolute right-0 mt-2 w-60 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_14px_40px_rgba(12,18,38,0.16)] z-30"
          }
        >
          <div
            className={
              isNotificationsDark
                ? "mb-3 rounded-xl border border-[rgba(94,129,178,0.32)] bg-[rgba(20,34,54,0.65)] px-3 py-2"
                : "rounded-xl bg-[#F9FAFB] px-3 py-2 mb-2"
            }
          >
            <p
              className={`text-sm font-semibold ${
                isNotificationsDark ? "text-[rgba(230,237,249,0.95)]" : "text-[#111827]"
              }`}
            >
              {user?.name ?? "Guest user"}
            </p>
            <p className={`text-xs ${isNotificationsDark ? "text-[rgba(188,208,239,0.72)]" : "text-[#6B7280]"}`}>
              {user?.email ?? "No email on file"}
            </p>
          </div>
          <ul className={`space-y-1 text-sm ${isNotificationsDark ? "text-[rgba(221,231,247,0.88)]" : "text-[#1F2937]"}`}>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/profile")}
                className={
                  isNotificationsDark
                    ? "notifications-menu-item flex w-full items-center justify-between rounded-lg px-3 py-2"
                    : "flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
                }
              >
                Profile
                <span>›</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/projects", { state: { filter: "mine" } })}
                className={
                  isNotificationsDark
                    ? "notifications-menu-item flex w-full items-center justify-between rounded-lg px-3 py-2"
                    : "flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
                }
              >
                My Projects
                <span>›</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/create")}
                className={
                  isNotificationsDark
                    ? "notifications-menu-item flex w-full items-center justify-between rounded-lg px-3 py-2"
                    : "flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
                }
              >
                My Templates
                <span>›</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/teams/new")}
                className={
                  isNotificationsDark
                    ? "notifications-menu-item flex w-full items-center justify-between rounded-lg px-3 py-2"
                    : "flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
                }
              >
                Create Team
                <span>›</span>
              </button>
            </li>
          </ul>
          <button
            type="button"
            onClick={handleLogout}
            className={
              isNotificationsDark
                ? "notifications-signout mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold"
                : "mt-2 flex w-full items-center justify-between rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm font-semibold text-[#B91C1C] hover:bg-[#FCA5A5]"
            }
          >
            Sign out
            <span aria-hidden="true">⟶</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SharedHeader({ variant = "default" }) {
  const location = useLocation();
  const themeMode = useThemeMode();
  const isDashboard = variant === "dashboard";
  const isNotificationsRoute = location.pathname === "/notifications";
  const isFeaturesRoute = location.pathname === "/features";
  const isProfileRoute = location.pathname === "/profile";
  const isHomeRoute = location.pathname === "/";
  const isAboutRoute = location.pathname === "/about";
  const isDashboardRoute = location.pathname === "/dashboard";
  const isNewTeamRoute = location.pathname === "/teams/new";
  const isScopedDark = (isNotificationsRoute || isFeaturesRoute || isProfileRoute || isHomeRoute || isAboutRoute || isDashboardRoute || isNewTeamRoute) && themeMode === "dark";
  const wrapperClasses = `${isDashboard ? "mb-6" : "mb-8 md:mb-10"}`;
  const barClasses = [
    "w-full transition-all duration-200",
    isScopedDark
      ? "notifications-nav h-[48px]"
      : `bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${isDashboard ? "h-[70px]" : ""}`
  ].join(" ");
  const innerClasses = [
    "mx-auto flex items-center justify-between",
    isDashboard ? "px-6 md:px-10" : "px-6",
    isScopedDark ? "notifications-nav-inner" : ""
  ].join(" ");

  return (
    <header className={`${wrapperClasses} ${isScopedDark ? "notifications-nav-wrapper" : ""}`}>
      <nav className={barClasses}>
        <div className={innerClasses}>
          <div className="flex items-center" style={{ paddingLeft: isDashboard ? "24px" : "0" }}>
            <Link to="/">
              <img
                src={logo}
                alt="Aramco Digital"
                className={`${isDashboard ? "h-12" : "h-16"} ${isScopedDark ? "notifications-nav-logo" : ""}`}
              />
            </Link>
          </div>
          <div className="hidden md:flex flex-1 justify-center">
            <ul
              className={`flex items-center gap-8 font-[500] text-[16px] ${
                isScopedDark ? "notifications-nav-list" : "text-[#1E1E1E]"
              }`}
            >
              {navItems.map(({ to, label, ariaLabel }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    aria-label={ariaLabel}
                    className={({ isActive }) => {
                      if (isScopedDark) {
                        return [
                          "notifications-nav-link rounded-full px-4 py-1.5 text-sm font-medium tracking-tight",
                          isActive
                            ? "notifications-nav-link--active"
                            : "notifications-nav-link--idle"
                        ]
                          .filter(Boolean)
                          .join(" ");
                      }
                      return `px-4 py-2 rounded-full transition-colors ${
                        isActive ? "font-semibold bg-[#EEF2FF] text-[#0C0C0C]" : "hover:text-[#0C0C0C]"
                      }`;
                    }}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center" style={{ paddingRight: isDashboard ? "24px" : "0" }}>
            {isDashboard && <UserMenu tone={isScopedDark ? "notifications-dark" : "default"} />}
          </div>
        </div>
      </nav>
    </header>
  );
}