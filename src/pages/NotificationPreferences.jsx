import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const gradientBackground =
  "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)";

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
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  const channels = useMemo(
    () => [
      { key: "email", label: "Email" },
      { key: "inApp", label: "In-app" },
      { key: "push", label: "Mobile Alerts" }
    ],
    []
  );

  const events = useMemo(
    () => [
      { key: "projectUpdates", label: "Project updates" },
      { key: "mentions", label: "Mentions" },
      { key: "security", label: "Security alerts" }
    ],
    []
  );

  const toggleChannel = (key) => {
    setStatusMessage("");
    setErrorMessage("");
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEvent = (key) => {
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

          if (!response.ok && response.status !== 404) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.message || "Unable to save preferences.");
          }
        } catch (networkError) {
          if (!(networkError instanceof TypeError)) {
            throw networkError;
          }
        }
      }

      setStatusMessage("Preferences saved successfully.");
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderToggle = ({ key, label }, checked, onToggle) => (
    <div
      key={key}
      className="flex items-center justify-between rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-colors"
    >
      <span className="text-base font-semibold text-[#111827]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(key)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
          checked ? "bg-[#2563EB]" : "bg-[#CBD5F5]"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );

  return (
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]">
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: gradientBackground }}
        />

        <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-12">
          <header className="flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <form
              onSubmit={handleSave}
              className="w-full max-w-[580px] space-y-8 rounded-[28px] border border-white/70 bg-white/80 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)]"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Notification Preferences</h1>
                <p className="text-sm text-[#6B7280]">
                  Decide how you’d like to be notified about updates, mentions, and security events.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Channels</h2>
                <div className="space-y-3">
                  {channels.map((channel) => renderToggle(channel, preferences[channel.key], toggleChannel))}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Events</h2>
                <div className="space-y-3">
                  {events.map((evt) => renderToggle(evt, preferences.events[evt.key], toggleEvent))}
                </div>
              </section>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>

              {statusMessage && (
                <div className="rounded-2xl bg-[#ECFDF5] px-4 py-3 text-sm font-medium text-[#047857]">{statusMessage}</div>
              )}
              {errorMessage && (
                <div className="rounded-2xl bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">{errorMessage}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


