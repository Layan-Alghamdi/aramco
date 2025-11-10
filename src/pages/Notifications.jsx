import React, { useState } from "react";
import SharedHeader from "@/components/SharedHeader";

const pageBackground = {
  background: "radial-gradient(circle at 20% 20%, #00A98E 0%, #2B7AC8 100%)"
};

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "24px",
  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
  padding: "60px",
  margin: "40px auto",
  width: "80%"
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
    <div className="min-h-screen" style={pageBackground}>
      <SharedHeader variant="dashboard" />
      <main className="px-6 py-10">
        <section style={cardStyle}>
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
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3E6DCC] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2c5ab8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6DCC]/40 transition"
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


