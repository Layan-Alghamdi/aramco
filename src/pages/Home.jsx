import React from "react";
import { Link } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
      {/* Top Navbar */}
      <header className="mb-8 md:mb-10">
        <div className="flex items-center justify-between">
          {/* Left: aramco digital logo (text + square) */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Aramco Digital" className="h-16 md:h-20 w-auto" />
          </div>

          {/* Center nav */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-10 text-[#6B7280] font-medium">
              <li><a className="hover:opacity-80 transition" href="#home">Home</a></li>
              <li><a className="hover:opacity-80 transition" href="#features">Features</a></li>
              <li><a className="hover:opacity-80 transition" href="#templates">Templates</a></li>
              <li><a className="hover:opacity-80 transition" href="#about">About</a></li>
            </ul>
          </nav>
          <div className="md:hidden" />
        </div>
      </header>

      {/* Hero Block */}
      <section className="relative overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 grid lg:grid-cols-2 items-center">
          {/* Left text column */}
          <div className="p-10 md:p-14">
            <h1 className="text-[#0A0A0A] font-extrabold tracking-tight leading-tight text-[40px] md:text-[56px] max-w-[520px]">
              <span className="block">Aramatrix –</span>
              <span className="block">Create AI-</span>
              <span className="block">Powered</span>
              <span className="block">Presentations Instantly</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-[18px] md:text-[20px] leading-relaxed text-[#4B5563]">
              Design smart slides, maintain brand consistency, and collaborate in real-time — no design skills required.
            </p>

            <Link to="/login" className="group inline-flex items-center gap-4 border border-[#C9CED6] rounded-full pl-8 pr-3 py-4 bg-white/70 backdrop-blur text-[#0A0A0A] font-semibold hover:shadow-md transition mt-8">
              <span>Start Now</span>
              <span className="grid place-items-center w-12 h-12 rounded-full bg-[#1B1533] text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition -rotate-45 group-hover:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </span>
            </Link>
          </div>

          {/* Right visual column */}
          <div className="p-10 md:p-14">
            <div className="w-full min-h-[360px] md:min-h-[420px] rounded-[28px]" />
          </div>
        </div>

        
      </section>
    </main>
  );
}


