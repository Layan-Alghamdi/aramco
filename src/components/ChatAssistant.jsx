import React, { useState, useRef, useEffect } from "react";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputValue.trim()
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    const updatedMessages = [...messages, userMessage];
    setInputValue("");
    setIsLoading(true);

    try {
      const requestBody = {
        messages: updatedMessages
      };
      
      console.log("FRONTEND: Sending to /api/chat", requestBody);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      console.log("FRONTEND: Response status:", response.status, response.statusText);
      console.log("FRONTEND: Response headers:", Object.fromEntries(response.headers.entries()));

      // Try to parse response body for both success and error cases
      let data;
      try {
        const text = await response.text();
        console.log("FRONTEND: Response text:", text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("FRONTEND: Failed to parse response as JSON:", parseError);
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
      }

      // Handle error responses (non-200 status codes)
      if (!response.ok) {
        console.error("FRONTEND: Response error - status not OK:", {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        // Use error message from response if available
        const errorMessage = data.message || data.reply || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Handle successful responses
      console.log("FRONTEND: Response data (success):", data);
      
      // Read reply from data.reply (matching backend response format)
      const replyText = data.reply;
      
      if (!replyText || typeof replyText !== 'string' || replyText.trim() === "") {
        console.warn("FRONTEND: Empty or invalid reply received:", replyText);
        throw new Error("Received empty response from assistant");
      }
      
      const assistantMessage = {
        role: "assistant",
        content: replyText
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Detailed error logging - DO NOT swallow errors silently
      console.error("FRONTEND: CHAT ERROR", {
        error: error,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Show user-friendly error message in UI
      const errorMessage = {
        role: "assistant",
        content: error.message || "Something went wrong. Please try again."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported on this browser.");
      return;
    }

    // Initialize recognition if not already done
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "ar-SA"; // Start with Arabic, browser will auto-detect English if spoken
    }

    // Always set up handlers to ensure they're current
    recognitionRef.current.onresult = (event) => {
      console.log("Speech recognition result event:", event);
      const transcript = event.results[event.results.length - 1][0].transcript;
      console.log("Transcribed text:", transcript);
      if (transcript && transcript.trim()) {
        setInputValue((prev) => {
          const newValue = prev + (prev ? " " : "") + transcript.trim();
          console.log("Setting input value to:", newValue);
          return newValue;
        });
      }
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "no-speech") {
        // User stopped speaking, this is normal
      } else {
        alert("Speech recognition error. Please try again.");
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
      alert("Could not start voice input. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#3E6DCC] text-white shadow-lg hover:bg-[#2853b2] transition-all hover:scale-105"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.3)] border border-white/20 backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-[#3E6DCC] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Assistant</h3>
                <p className="text-xs text-white/80">I'm here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-[#6B7280] mb-2">👋 Hello! How can I help you today?</p>
                  <p className="text-xs text-[#9CA3AF]">Ask me about templates, saving, shortcuts, or anything else!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.role === "user"
                        ? "bg-[#3E6DCC] text-white rounded-br-sm"
                        : "bg-[#F3F4F6] text-[#1E1E1E] rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[#F3F4F6] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-xs text-[#6B7280]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E7EB] p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || isListening}
                className="flex-1 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#1E1E1E] placeholder:text-[#9CA3AF] focus:border-[#3E6DCC] focus:outline-none focus:ring-2 focus:ring-[#3E6DCC]/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300`}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
              >
                {isListening ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 6h12v12H6z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || isListening}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3E6DCC] text-white hover:bg-[#2853b2] transition disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;

