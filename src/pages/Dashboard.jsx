import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const iconColor = "#6B7280";

const icons = {
  plusCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  folder: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h5l1.5 1.5H19a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17V7.5Z" />
    </svg>
  ),
  userPlus: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 11a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
      <path d="M4 18.75A5.75 5.75 0 0 1 9.75 13h4.5A5.75 5.75 0 0 1 20 18.75" />
      <path d="M19 7v3M17.5 8.5H20.5" />
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm9 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
      <path d="M3 19a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6" />
    </svg>
  )
};

const cards = [
  { title: "Create", path: "/projects/create", icon: icons.plusCircle },
  { title: "Projects", path: "/projects", icon: icons.folder },
  { title: "New team", path: "/teams/new", icon: icons.userPlus },
  { title: "your teams", path: "/teams", icon: icons.users }
];

const missingRoutes = new Set(["/projects/create", "/projects", "/teams/new", "/teams"]);

export default function Dashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const handleCardClick = (path) => {
    if (missingRoutes.has(path)) {
      setToast("Not implemented yet");
      setTimeout(() => setToast(""), 2200);
      return;
    }
    navigate(path);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

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

        <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-9">
          <header className="flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <nav>
              <ul className="flex items-center gap-8 text-[#6B7280] font-medium">
                {"Home Notification Features About".split(" ").map((item) => (
                  <li key={item} className="hover:opacity-80 transition">{item}</li>
                ))}
              </ul>
            </nav>
          </header>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 xl:gap-10">
              {cards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => handleCardClick(card.path)}
                  className="w-[220px] h-[180px] sm:w-[220px] sm:h-[190px] lg:w-[240px] lg:h-[190px] xl:w-[260px] xl:h-[200px] rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] flex flex-col items-center justify-center gap-4 text-[#4B5563] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-lg font-semibold">{card.title}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleProfileClick}
            className="absolute bottom-6 left-8 flex flex-col items-center gap-2 text-[#6B7280] hover:text-[#374151] transition"
          >
            <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#6B7280] flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="currentColor">
                <circle cx="12" cy="9" r="4" />
                <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" />
              </svg>
            </span>
            <span className="text-sm font-medium">Profile</span>
          </button>

          {toast && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1F2937] text-white text-sm px-4 py-2 rounded-full shadow-lg">
              {toast}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

