import React, { useState } from "react";
import SharedHeader from "@/components/SharedHeader";

const gradientStyle = {
  background:
    "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
};

const initialNotifications = [
  {
    id: "mentions",
    title: "Mentions",
    description: "When someone tags you in a slide or comment."
  },
  {
    id: "team-activity",
    title: "Team activity",
    description: "New slides, edits, and exports."
  },
  {
    id: "system-alerts",
    title: "System alerts",
    description: "Autosave, export results, errors."
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const hasNotifications = notifications.length > 0;

  return (
    <>
      <SharedHeader />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 pt-12 md:pt-14 pb-20">
        <section className="relative overflow-hidden rounded-[28px] min-h-[420px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={gradientStyle} />
          <div className="relative z-10 p-10 md:p-14">
            <div className="max-w-[560px]">
              <h1 className="text-[#0A0A0A] text-3xl md:text-4xl font-extrabold tracking-tight">Notifications</h1>
              <p className="mt-4 text-lg text-[#4B5563]">
                Stay up to date with workspace alerts and project events.
              </p>
              <ul className="mt-8 space-y-3 text-[#1F2937]">
                {hasNotifications ? (
                  notifications.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#1B1533]" aria-hidden="true" />
                      <p className="text-base leading-relaxed">
                        <span className="font-semibold">{item.title}:</span> {item.description}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="list-none text-[#4B5563]">All caught up. No unread notifications.</li>
                )}
              </ul>
              <button
                type="button"
                onClick={() => setNotifications([])}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 text-sm font-semibold text-[#1B1533] shadow-sm hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
                aria-label="Mark all notifications as read"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


