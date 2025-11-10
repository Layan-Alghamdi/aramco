import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { signOutUser } from "@/lib/usersStore";

const navItems = [
  { to: "/", label: "Home", ariaLabel: "Go to Home" },
  { to: "/notifications", label: "Notification", ariaLabel: "Go to Notifications" },
  { to: "/features", label: "Features", ariaLabel: "Go to Features" },
  { to: "/about", label: "About", ariaLabel: "Go to About" }
];

const baseClasses =
  "px-3 py-2 text-sm hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md transition";

function UserMenu() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name || "Profile"} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#3E6DCC] text-xs font-semibold text-white">
            {initials}
          </span>
        )}
        <span className="hidden sm:block text-left">
          <span className="block text-xs text-[#6B7280]">{user?.role ?? "Collaborator"}</span>
          <span className="block text-sm font-semibold text-[#1F2937] leading-tight">
            {user?.name ?? "Guest"}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-[#6B7280] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.063l3.71-3.832a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0l-4.25-4.39a.75.75 0 0 1 .02-1.061Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_14px_40px_rgba(12,18,38,0.16)] z-30">
          <div className="rounded-xl bg-[#F9FAFB] px-3 py-2 mb-2">
            <p className="text-sm font-semibold text-[#111827]">{user?.name ?? "Guest user"}</p>
            <p className="text-xs text-[#6B7280]">{user?.email ?? "No email on file"}</p>
          </div>
          <ul className="space-y-1 text-sm text-[#1F2937]">
            <li>
              <button
                type="button"
                onClick={handleNavigate("/profile")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
              >
                Profile
                <span>›</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/projects", { state: { filter: "mine" } })}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
              >
                My Projects
                <span>›</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/create")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
              >
                My Templates
                <span>›</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNavigate("/teams/new")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#EEF2FF]"
              >
                Create Team
                <span>›</span>
              </button>
            </li>
          </ul>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-between rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm font-semibold text-[#B91C1C] hover:bg-[#FCA5A5]"
          >
            Sign out
            <span aria-hidden="true">⟶</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SharedHeader({ variant = "default", height }) {
  const isDashboard = variant === "dashboard";
  const wrapperClasses = `${isDashboard ? "mb-6" : "mb-8 md:mb-10"}`;
  const barClassName = `w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]`;
  const barStyle = {
    height: height ?? (isDashboard ? "70px" : undefined)
  };
  const innerClasses = `mx-auto flex items-center justify-between ${isDashboard ? "px-6 md:px-10" : "px-6"}`;

  return (
    <header className={wrapperClasses}>
      <nav className={barClassName} style={barStyle}>
        <div className={innerClasses}>
          <div className="flex items-center" style={{ paddingLeft: isDashboard ? "24px" : "0" }}>
            <Link to="/">
              <img src={logo} alt="Aramco Digital" className={isDashboard ? "h-12" : "h-16"} />
            </Link>
          </div>
          <div className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-8 font-[500] text-[16px] text-[#1E1E1E]">
              {navItems.map(({ to, label, ariaLabel }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    aria-label={ariaLabel}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full transition-colors ${isActive ? "font-semibold bg-[#EEF2FF] text-[#0C0C0C]" : "hover:text-[#0C0C0C]"}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center" style={{ paddingRight: isDashboard ? "24px" : "0" }}>
            {isDashboard && <UserMenu />}
          </div>
        </div>
      </nav>
    </header>
  );
}