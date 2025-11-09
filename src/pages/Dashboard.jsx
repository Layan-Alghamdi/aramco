import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Folder, UserPlus } from "lucide-react";
import SharedHeader from "@/components/SharedHeader";
import Toast from "@/components/Toast";
import TeamsGrid from "@/components/TeamsGrid";
import useTeams from "@/hooks/useTeams";

const iconColor = "#3E6DCC";
const iconSize = 28;

const icons = {
  plusCircle: <PlusCircle size={iconSize} color={iconColor} strokeWidth={1.5} />,
  folder: <Folder size={iconSize} color={iconColor} strokeWidth={1.5} />,
  userPlus: <UserPlus size={iconSize} color={iconColor} strokeWidth={1.5} />
};

const quickCards = [
  { title: "Create", path: "/create", icon: icons.plusCircle },
  { title: "Projects", path: "/projects", icon: icons.folder }
];

const missingRoutes = new Set(["/projects"]);

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
    <>
      <SharedHeader />
      <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10">
        <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[676px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
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
          </div>
        </div>
      </section>
    </>
  );
}

