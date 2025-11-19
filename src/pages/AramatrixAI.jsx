import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";
import useThemeMode from "@/hooks/useThemeMode";

export default function AramatrixAI() {
  const navigate = useNavigate();
  const themeMode = useThemeMode();
  const isDarkMode = themeMode === "dark";

  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [extraDetails, setExtraDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }
    setIsGenerating(true);
    // TODO: Implement AI slide generation logic
    setTimeout(() => {
      setIsGenerating(false);
      // Placeholder: Navigate to editor or show success message
      console.log("Generating slides for:", { topic, slideCount, extraDetails });
    }, 2000);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-[#010E24] via-[#041B2B] to-[#003C47]" : "bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)]"} transition-colors duration-500`}>
      <SharedHeader variant="dashboard" />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-10">
        <div className={`w-full max-w-2xl rounded-[24px] ${isDarkMode ? "bg-[#0B1622] border border-[#1F2937]" : "bg-white"} shadow-[0_6px_24px_rgba(0,0,0,0.08)] px-10 py-12 transition-colors duration-500`}>
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={`flex items-center gap-2 rounded-full ${isDarkMode ? "bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.15)]" : "bg-white/70 text-[#3E6DCC]"} px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              Aramatrix AI – Smart Slide Creator
            </h1>
            <p className={`text-base ${isDarkMode ? "text-[#C7D2DE]" : "text-[#6B7280]"}`}>
              Generate full presentation slides instantly using AI.
            </p>
          </div>

          <div className="space-y-6">
            {/* Topic Input */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-[#E4E8EE]" : "text-[#1E1E1E]"}`}>
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your presentation topic..."
                className={`w-full rounded-xl border ${isDarkMode ? "bg-[#141C2E] border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(255,255,255,0.45)]" : "bg-white border-[#E5E7EB] text-[#1E1E1E] placeholder:text-[#6B7280]"} px-4 py-3 text-sm focus:outline-none focus:ring-2 ${isDarkMode ? "focus:ring-[#1A73E8]/50" : "focus:ring-[#3E6DCC]/50"} transition-colors`}
              />
            </div>

            {/* Slide Count Selector */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-[#E4E8EE]" : "text-[#1E1E1E]"}`}>
                Number of Slides
              </label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className={`w-full rounded-xl border ${isDarkMode ? "bg-[#141C2E] border-[rgba(255,255,255,0.1)] text-white" : "bg-white border-[#E5E7EB] text-[#1E1E1E]"} px-4 py-3 text-sm focus:outline-none focus:ring-2 ${isDarkMode ? "focus:ring-[#1A73E8]/50" : "focus:ring-[#3E6DCC]/50"} transition-colors`}
              >
                {[3, 5, 7, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} slides
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Details */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-[#E4E8EE]" : "text-[#1E1E1E]"}`}>
                Add Extra Details (Optional)
              </label>
              <textarea
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
                placeholder="Add any additional context, requirements, or details..."
                rows={4}
                className={`w-full rounded-xl border ${isDarkMode ? "bg-[#141C2E] border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(255,255,255,0.45)]" : "bg-white border-[#E5E7EB] text-[#1E1E1E] placeholder:text-[#6B7280]"} px-4 py-3 text-sm focus:outline-none focus:ring-2 ${isDarkMode ? "focus:ring-[#1A73E8]/50" : "focus:ring-[#3E6DCC]/50"} transition-colors resize-none`}
              />
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className={`w-full rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#007B7F] to-[#1A73E8] text-white shadow-[0_0_15px_rgba(26,115,232,0.6)] hover:shadow-[0_0_25px_rgba(26,115,232,0.8)]" : "bg-[#3E6DCC] text-white shadow-[0_10px_22px_rgba(62,109,204,0.28)] hover:shadow-[0_14px_26px_rgba(62,109,204,0.36)]"} px-6 py-3 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isGenerating ? "Generating Slides..." : "Generate Slides"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

