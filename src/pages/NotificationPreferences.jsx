import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useThemeMode from "@/hooks/useThemeMode";

const gradientBackground =
  "#FFFFFF";

const defaultPreferences = {
  email: true,
  inApp: true,
  push: true,
  events: {
    projectUpdates: true,
    mentions: true,
    security: false
  }
};

function loadPreferences() {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = window.localStorage.getItem("notificationPreferences");
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw);
    return {
      email: Boolean(parsed.email),
      inApp: Boolean(parsed.inApp),
      push: Boolean(parsed.push),
      events: {
        projectUpdates: Boolean(parsed?.events?.projectUpdates),
        mentions: Boolean(parsed?.events?.mentions),
        security: Boolean(parsed?.events?.security)
      }
    };
  } catch (error) {
    console.error("Failed to parse notification preferences", error);
    return defaultPreferences;
  }
}

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const themeMode = useThemeMode();
  const isDark = themeMode === "dark";

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  useEffect(() => {
    document.body.classList.add("notification-preferences-surface");
    return () => {
      document.body.classList.remove("notification-preferences-surface");
      document.body.classList.remove("dark-notification-preferences");
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-notification-preferences");
    } else {
      document.body.classList.remove("dark-notification-preferences");
    }
  }, [isDark]);

  const channelToggles = useMemo(
    () => [
      { key: "email", label: "Email" },
      { key: "inApp", label: "In-app" },
      { key: "push", label: "Mobile Alerts" }
    ],
    []
  );

  const eventToggles = useMemo(
    () => [
      { key: "projectUpdates", label: "Project updates" },
      { key: "mentions", label: "Mentions" },
      { key: "security", label: "Security alerts" }
    ],
    []
  );

  const handleChannelToggle = (key) => {
    setStatusMessage("");
    setErrorMessage("");
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEventToggle = (key) => {
    setStatusMessage("");
    setErrorMessage("");
    setPreferences((prev) => ({
      ...prev,
      events: { ...prev.events, [key]: !prev.events[key] }
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      window.localStorage.setItem("notificationPreferences", JSON.stringify(preferences));

      if (typeof fetch === "function") {
        try {
          const response = await fetch("/api/user/notification-preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preferences)
          });

          if (response.ok) {
            console.info("Notification preferences synced with server.");
          } else if (response.status === 404) {
            console.info("Notification preferences endpoint not available; stored locally only.");
          } else {
            const errorPayload = await response.json().catch(() => ({}));
            throw new Error(errorPayload.message || "Unable to save preferences.");
          }
        } catch (networkError) {
          if (networkError instanceof TypeError) {
            console.warn("Network error while syncing preferences; stored locally.", networkError);
          } else {
            throw networkError;
          }
        }
      }

      setStatusMessage("Preferences saved successfully.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to save notification preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderToggleRow = ({ key, label }, checked, onToggle) => (
    <div className="notification-preferences-row flex items-center justify-between rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.08)]" key={key}>
      <span className="notification-preferences-row-label text-base font-semibold text-[#111827]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(key)}
        className={`notification-preferences-toggle relative inline-flex h-8 w-14 items-center rounded-full transition ${
          checked ? "notification-preferences-toggle--on" : "notification-preferences-toggle--off"
        }`}
      >
        <span
          className={`notification-preferences-handle inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );

  return (
    <section
      className="notification-preferences-shell min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]"
      style={isDark ? undefined : { background: gradientBackground }}
    >
      <div className="notification-preferences-frame relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="notification-preferences-overlay absolute inset-0 pointer-events-none"
          style={{ background: gradientBackground }}
        />

        <div className="notification-preferences-inner relative z-10 flex h-full flex-col px-10 pt-8 pb-12">
          <header className="notification-preferences-header flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="notification-preferences-back inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <form
              onSubmit={handleSave}
              className="notification-preferences-card w-full max-w-[580px] space-y-8 rounded-[28px] border border-white/70 bg-white/80 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)]"
            >
              <div className="space-y-2">
                <h1 className="notification-preferences-title text-3xl font-bold text-[#111827] tracking-tight">
                  Notification Preferences
                </h1>
                <p className="notification-preferences-description text-sm text-[#6B7280]">
                  Choose how you’d like to stay informed about updates, mentions, and security events.
                </p>
              </div>

              <section className="space-y-4">
                <div>
                  <h2 className="notification-preferences-section text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                    Channels
                  </h2>
                </div>
                <div className="space-y-3">
                  {channelToggles.map((toggle) => renderToggleRow(toggle, preferences[toggle.key], handleChannelToggle))}
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="notification-preferences-section text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                    Events
                  </h2>
                </div>
                <div className="space-y-3">
                  {eventToggles.map((toggle) =>
                    renderToggleRow(toggle, preferences.events[toggle.key], handleEventToggle)
                  )}
                </div>
              </section>

              <div className="flex items-center justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="notification-preferences-save inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>

              {statusMessage && (
                <div className="notification-preferences-status notification-preferences-status--success rounded-2xl bg-[#ECFDF5] px-4 py-3 text-sm font-medium text-[#047857]">
                  {statusMessage}
                </div>
              )}

              {errorMessage && (
                <div className="notification-preferences-status notification-preferences-status--error rounded-2xl bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


