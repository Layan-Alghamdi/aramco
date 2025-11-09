<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Folder, UserPlus } from "lucide-react";
import SharedHeader from "@/components/SharedHeader";
import Toast from "@/components/Toast";
import TeamsGrid from "@/components/TeamsGrid";
import useTeams from "@/hooks/useTeams";
=======
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
>>>>>>> 74ea87d553f394f8aaf8e542725b0e788b690950

const iconColor = "#3E6DCC";

const icons = {
<<<<<<< HEAD
  plusCircle: <PlusCircle size={iconSize} color={iconColor} strokeWidth={1.5} />,
  folder: <Folder size={iconSize} color={iconColor} strokeWidth={1.5} />,
  userPlus: <UserPlus size={iconSize} color={iconColor} strokeWidth={1.5} />
=======
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
>>>>>>> 74ea87d553f394f8aaf8e542725b0e788b690950
};

const quickCards = [
  { title: "Create", path: "/create", icon: icons.plusCircle },
  { title: "Projects", path: "/projects", icon: icons.folder }
];

<<<<<<< HEAD
const missingRoutes = new Set(["/projects"]);
=======
const missingRoutes = new Set(["/teams/new", "/teams"]);
>>>>>>> 74ea87d553f394f8aaf8e542725b0e788b690950

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState("");
  const teams = useTeams();

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      setTimeout(() => setToast(""), 2200);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const handleCardClick = (path) => {
    if (!path) return;
    if (path === "/projects") {
      navigate("/projects");
      return;
    }
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
<<<<<<< HEAD
    <>
      <SharedHeader />
      <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]">
        <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[676px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)'
            }}
          />

          <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-9">
            <div className="flex flex-1 flex-col gap-8">
              <div className="flex flex-wrap justify-center gap-6 lg:gap-8 xl:gap-10">
                {quickCards.map((card) => (
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
                <button
                  type="button"
                  onClick={() => navigate("/teams/new")}
                  className="w-[220px] h-[180px] sm:w-[220px] sm:h-[190px] lg:w-[240px] lg:h-[190px] xl:w-[260px] xl:h-[200px] rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] flex flex-col items-center justify-center gap-4 text-[#4B5563] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
                    {icons.userPlus}
                  </div>
                  <span className="text-lg font-semibold">New team</span>
                </button>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFF] px-6 py-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] border border-[#E5E7EB]">
                      <span className="text-sm font-semibold text-[#4B5563]">👥</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#1B1533]">Your teams</h2>
                      <p className="text-sm text-[#6B7280]">
                        Quickly access the teams you manage.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/teams/new")}
                    className="inline-flex items-center rounded-full bg-[#1B1533] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                  >
                    Create team
                  </button>
                </div>
                <div className="mt-6">
                  <TeamsGrid teams={teams} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProfileClick}
              className="absolute bottom-2 left-8 flex flex-col items-center gap-2 text-[#6B7280] hover:text-[#374151] transition"
            >
              <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#6B7280] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="currentColor">
                  <circle cx="12" cy="9" r="4" />
                  <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" />
                </svg>
              </span>
              <span className="text-sm font-medium">Profile</span>
            </button>

            <Toast message={toast} />
=======
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-['Poppins',ui-sans-serif]">
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(115% 115% at 50% 50%, #E6EEFF 0%, #93B9FF 55%, #3E6DCC 100%)"
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0) 60%)"
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(110% 110% at 100% 100%, rgba(23,48,107,0.55) 0%, rgba(23,48,107,0.12) 40%, rgba(23,48,107,0) 70%)"
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
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 xl:gap-10 text-[#6B7280]">
              {cards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => handleCardClick(card.path)}
                  className="w-[220px] h-[180px] sm:w-[220px] sm:h-[190px] lg:w-[240px] lg:h-[190px] xl:w-[260px] xl:h-[200px] rounded-[22px] border border-[#E4E8F0] bg-white flex flex-col items-center justify-center gap-4 text-[#4B5563] transition-all duration-200 hover:-translate-y-1 cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#F2F4F8] border border-[#E0E6F3] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-lg font-semibold text-[#1E1E1E]">{card.title}</span>
                </button>
              ))}
            </div>
>>>>>>> 74ea87d553f394f8aaf8e542725b0e788b690950
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

