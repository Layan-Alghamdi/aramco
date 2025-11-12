import React from "react";
import { Link } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] dark:bg-[linear-gradient(135deg,#010E24,#041B2B)] transition-[background-color,background-image] duration-400 ease-out">
      <SharedHeader variant="dashboard" />
      <main className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 transition-[background-color] duration-400 ease-out">
        <section className="relative w-full max-w-[1200px] rounded-[24px] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.08),0_0_30px_rgba(0,150,255,0.2)] overflow-hidden dark:bg-transparent dark:shadow-none">
          <div className="relative grid lg:grid-cols-2 items-center">
            <div className="p-10 md:p-14">
              <h1 className="text-black font-extrabold tracking-tight leading-tight space-y-2 transition-colors duration-400 ease-out dark:text-white">
                <span className="block text-[2.75rem] sm:text-6xl lg:text-7xl">Aramatrix</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-current dark:text-[#E4E8EE] transition-colors duration-400 ease-out">
                  Create AI-Powered Presentations Instantly
                </span>
              </h1>
              <p className="mt-6 max-w-[560px] text-sm sm:text-base leading-relaxed text-gray-500 transition-colors duration-400 ease-out dark:text-[#B0B8C2]">
                Design smart slides, maintain brand consistency, and collaborate in real-time — no design skills required.
              </p>

              <Link
                to="/login"
                className="group inline-flex items-center gap-4 border border-[#C9CED6] rounded-full pl-8 pr-3 py-4 bg-white/70 backdrop-blur text-[#0A0A0A] font-semibold hover:shadow-md transition mt-8 transform-gpu duration-300 ease-out dark:border-transparent dark:bg-[linear-gradient(90deg,#007B7F,#1A73E8)] dark:text-white dark:shadow-[0_0_15px_rgba(26,115,232,0.6)] dark:hover:shadow-[0_0_25px_rgba(26,115,232,0.8)] dark:hover:scale-105"
              >
                <span>Start Now</span>
                <span className="grid place-items-center w-12 h-12 rounded-full bg-[#1B1533] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 transition -rotate-45 group-hover:rotate-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="p-10 md:p-14">
              <div className="w-full min-h-[360px] md:min-h-[420px] rounded-[28px]" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


