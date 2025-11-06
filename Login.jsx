import React from "react";

const Login = () => {
  const containerStyle = {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "48px 24px",
    boxSizing: "border-box",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
    color: "#0a0a0a"
  };

  const headerStyle = {
    position: "absolute",
    top: 24,
    left: 24,
    display: "flex",
    alignItems: "center",
    gap: 12
  } as const;

  const stageStyle = {
    width: "100%",
    maxWidth: 1160,
    background: "linear-gradient(135deg, rgba(244,240,248,0.8), rgba(244,240,248,0.35))",
    borderRadius: 24,
    padding: 24,
    position: "relative",
    boxShadow: "0 1px 0 rgba(0,0,0,0.04) inset"
  } as const;

  const gradientPanelStyle = {
    width: "100%",
    minHeight: 560,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    background:
      "radial-gradient(1200px 600px at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 60%), linear-gradient(120deg, #2a8bf2 10%, #0e54b5 45%, #0aa55c 90%)"
  } as const;

  const cardStyle = {
    position: "absolute",
    left: 48,
    top: 120,
    width: 620,
    maxWidth: "calc(100% - 96px)",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "saturate(180%) blur(6px)",
    WebkitBackdropFilter: "saturate(180%) blur(6px)",
    borderRadius: 20,
    padding: 36,
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.08)"
  } as const;

  const titleStyle = {
    fontSize: 40,
    lineHeight: "44px",
    fontWeight: 800,
    margin: "4px 0 28px 0"
  } as const;

  const fieldWrapperStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    background: "#ffffff",
    borderRadius: 24,
    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "12px 16px",
    height: 48
  } as const;

  const inputStyle = {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 16,
    color: "#0f172a",
    background: "transparent"
  } as const;

  const buttonStyle = {
    marginTop: 26,
    height: 52,
    borderRadius: 28,
    width: "100%",
    background: "#222",
    color: "#fff",
    fontWeight: 700,
    fontSize: 18,
    border: "1px solid rgba(0,0,0,0.6)",
    boxShadow: "0 2px 0 rgba(255,255,255,0.1) inset, 0 8px 16px rgba(0,0,0,0.2)",
    cursor: "pointer"
  } as const;

  const labelStyle = {
    margin: "0 0 8px 12px",
    fontSize: 14,
    color: "#475569",
    fontWeight: 600
  } as const;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <img
          src="/pic/aramco_digital_logo_transparent-removebg-preview.png"
          alt="aramco digital"
          style={{ height: 40, width: "auto" }}
        />
      </div>

      <div style={stageStyle}>
        <div style={gradientPanelStyle}>
          <div style={cardStyle}>
            <div style={titleStyle}>Log in</div>

            {/* Email */}
            <div style={labelStyle}>User Email</div>
            <div style={fieldWrapperStyle}>
              {/* User icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z" fill="#64748B"/>
                <path d="M4 20.25C4 16.798 7.134 14 12 14s8 2.798 8 6.25V22H4v-1.75Z" fill="#94A3B8"/>
              </svg>
              <input style={inputStyle} type="email" placeholder="User Email" aria-label="User Email" />
            </div>

            {/* Password */}
            <div style={{ ...labelStyle, marginTop: 18 }}>Password</div>
            <div style={fieldWrapperStyle}>
              {/* Lock icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3.5" y="10" width="17" height="11" rx="2.5" fill="#94A3B8"/>
                <path d="M7.5 10V7.5A4.5 4.5 0 0 1 12 3a4.5 4.5 0 0 1 4.5 4.5V10" stroke="#64748B" strokeWidth="2"/>
              </svg>
              <input style={inputStyle} type="password" placeholder="Password" aria-label="Password" />
            </div>

            <button style={buttonStyle}>Log in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


