import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

const SESSION_DURATION_MS = 5 * 60 * 1000;

async function hashString(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createSession() {
  const token = window.crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  window.localStorage.setItem("sessionToken", token);
  window.localStorage.setItem("sessionExpiry", String(expiresAt));
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("isAuth") === "1") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password cannot be empty.");
      return;
    }

    const hashedPassword = await hashString(trimmedPassword);

    window.localStorage.setItem("userEmail", trimmedEmail);
    window.localStorage.setItem("userPasswordHash", hashedPassword);

    window.localStorage.setItem("isAuth", "1");
    window.localStorage.removeItem("userPassword");
    createSession();
    setError("");
    navigate("/dashboard");
  };

  return (
    <section className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]">
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)'
          }}
        />

        {/* centered card area */}
        <div className="relative z-10 grid place-items-center py-16">
          <div className="w-[88%] md:w-[68%] lg:w-[54%]">
            <div className="mx-auto max-w-[560px] rounded-[22px] border border-[#C9CED6] bg-white/70 backdrop-blur-[2px] px-6 py-8 md:px-10 md:py-12 shadow-[0_2px_0_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.06)]">
              {/* Centered header row: title + logo */}
              <div className="w-full flex items-center justify-between mb-8 px-2 md:px-4">
                <h1 className="text-[32px] md:text-[44px] font-extrabold tracking-tight text-[#0A0A0A] m-0">Log in</h1>
                <img src={logo} alt="Aramco Digital" className="h-16 md:h-20 w-auto translate-x-3 md:translate-x-4" />
              </div>

              {/* inputs */}
              <div className="space-y-4 mb-6">
                {/* email */}
                <label className="sr-only" htmlFor="email">User Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full bg-[#EFEFEF] text-[#1f2937]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h2a5 5 0 0 1 10 0h2c0-3.866-3.134-7-7-7z"/></svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="User Email"
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-[#C9CED6] text-[16px] placeholder:text-[#9aa3af] focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                {/* password */}
                <label className="sr-only" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full bg-[#EFEFEF] text-[#1f2937]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 8.732V17a1 1 0 1 1 2 0v-.268a2 2 0 1 1-2 0ZM9 8V6a3 3 0 0 1 6 0v2H9Z"/></svg>
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-[#C9CED6] text-[16px] placeholder:text-[#9aa3af] focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full h-12 md:h-[56px] rounded-full bg-[#222222] text-white text-[16px] md:text-[18px] font-semibold shadow-sm hover:shadow-md hover:opacity-95 active:translate-y-[1px] transition"
                aria-label="Log in"
                onClick={handleLogin}
              >
                Log in
              </button>
              {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}


