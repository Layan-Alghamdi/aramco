import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const navItems = [
  { to: "/", label: "Home", ariaLabel: "Go to Home" },
  { to: "/notifications", label: "Notification", ariaLabel: "Go to Notifications" },
  { to: "/features", label: "Features", ariaLabel: "Go to Features" },
  { to: "/about", label: "About", ariaLabel: "Go to About" }
];

const baseClasses =
  "px-3 py-2 text-sm text-gray-600 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md transition";

export default function SharedHeader() {
  return (
    <header className="mb-8 md:mb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Aramatrix Home">
            <img src={logo} alt="Aramatrix" className="h-16 md:h-20 w-auto" />
          </Link>
        </div>
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8 font-medium">
            {navItems.map(({ to, label, ariaLabel }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  aria-label={ariaLabel}
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? "font-semibold text-gray-900" : "text-[#6B7280]"}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:hidden" />
      </div>
    </header>
  );
}


