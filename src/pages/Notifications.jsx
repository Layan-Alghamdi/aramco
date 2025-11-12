import React, { useState } from "react";
import SharedHeader from "@/components/SharedHeader";

const initialNotifications = [
  {
    id: "mentions",
    title: "Mentions",
    description: "When someone tags you in a slide or comment.",
    accent: {
      dotClass: "bg-[#3b82f6]",
      glowClass: "shadow-[0_0_10px_rgba(59,130,246,0.45)]"
    }
  },
  {
    id: "team-activity",
    title: "Team activity",
    description: "New slides, edits, and exports.",
    accent: {
      dotClass: "bg-[#10b981]",
      glowClass: "shadow-[0_0_10px_rgba(16,185,129,0.45)]"
    }
  },
  {
    id: "system-alerts",
    title: "System alerts",
    description: "Autosave, export results, errors.",
    accent: {
      dotClass: "bg-[#60a5fa]",
      glowClass: "shadow-[0_0_10px_rgba(96,165,250,0.5)]"
    }
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const hasNotifications = notifications.length > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] transition-colors duration-200 ease-out dark:bg-[linear-gradient(180deg,#0f1b2d_0%,#0b1426_100%)]">
      <SharedHeader variant="dashboard" />
      <main className="px-6 py-10">
        <section className="mx-auto my-10 w-[80%] rounded-[24px] border border-white/70 bg-white/95 p-10 shadow-[0_6px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-colors duration-200 ease-out dark:border-[#243244] dark:bg-[#0f172a]/95 dark:shadow-[0_20px_60px_rgba(3,12,29,0.45)]">
          <div className="max-w-[560px]">
            <h1 className="text-[40px] font-extrabold tracking-tight text-[#0A0A0A] transition-colors duration-200 ease-out dark:text-[#e6edf3]">
              Notifications
            </h1>
            <p className="mt-4 text-lg text-[#4B5563] transition-colors duration-200 ease-out dark:text-[#b6c2cf]">
              Stay up to date with workspace alerts and project events.
            </p>
            <ul className="mt-8 space-y-3 text-[#1F2937] transition-colors duration-200 ease-out dark:text-[#d6dee6]">
              {hasNotifications ? (
                notifications.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span
                      className={`mt-1 h-3 w-3 rounded-full ${item.accent.dotClass} ${item.accent.glowClass} transition-transform duration-200 ease-out dark:saturate-150`}
                      aria-hidden="true"
                    />
                    <p className="text-base leading-relaxed">
                      <span className="font-semibold">{item.title}:</span> {item.description}
                    </p>
                  </li>
                ))
              ) : (
                <li className="list-none text-[#6B7280] transition-colors duration-200 ease-out dark:text-[#b6c2cf]">
                  All caught up. No unread notifications.
                </li>
              )}
            </ul>
            <button
              type="button"
              onClick={() => setNotifications([])}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.32)] transition duration-200 ease-out hover:scale-[1.02] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0f172a]"
              aria-label="Mark all notifications as read"
            >
              Mark all as read
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}


