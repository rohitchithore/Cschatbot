import React, { useState, useRef, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import "./App.css";

// SVG Icon Components for Premium Legal-Tech Aesthetic
const ScalesIcon = () => (
  <svg className="svg-icon scale-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H7M4.5 7.5L7 17.5M19.5 7.5L17 17.5M2 22h20M7 5l5-3 5 3" />
    <path d="M4 17.5a3 3 0 0 0 6 0M14 17.5a3 3 0 0 0 6 0" />
  </svg>
);

const BotIcon = () => (
  <svg className="svg-icon bot-avatar-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H7M5 7.5L7 14M19 7.5L17 14M2 22h20" />
    <path d="M5 14a2 2 0 0 0 4 0M15 14a2 2 0 0 0 4 0" />
  </svg>
);

const SendIcon = () => (
  <svg className="svg-icon send-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

// Quick-start suggestion cards for Indian Company Law
const suggestedPrompts = [
  {
    title: "Company Incorporation",
    desc: "Procedure to incorporate a Private Limited Company.",
    prompt: "What is the procedure for incorporating a Private Limited Company in India?"
  },
  {
    title: "AGM Timelines",
    desc: "Due dates and rules for holding an Annual General Meeting.",
    prompt: "What are the rules and due dates for holding an Annual General Meeting (AGM) under the Companies Act 2013?"
  },
  {
    title: "Director Duties",
    desc: "Key roles and duties of a director in an Indian company.",
    prompt: "What are the key duties and liabilities of a director under Indian Company Law?"
  },
  {
    title: "OPC Rules",
    desc: "Compliance rules for One Person Companies (OPC).",
    prompt: "Can you explain the annual compliance requirements for a One Person Company (OPC) in India?"
  }
];

export default function App() {
  const { user } = useUser();
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm Rohit's AI. Ask me anything about Indian Company Law." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const API = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const botMsg = { role: "bot", text: data.reply || data.error || "No response received." };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Error: Could not reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayName =
    user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "User";

  return (
    <div className="app">
      <header className="header">
        <div className="header-bar">
          <div className="brand-lockup">
            <ScalesIcon />
            <h1>Rohit's AI</h1>
          </div>

          <div className="auth-slot">
            <SignedOut>
              <div className="auth-actions">
                <SignInButton mode="modal">
                  <button className="auth-button auth-button-ghost" type="button">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="auth-button" type="button">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="user-chip">
                <div className="user-copy">
                  <span className="user-label">Signed in as</span>
                  <strong>{displayName}</strong>
                </div>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>

        <p>Expert guidance on Indian Company Law &amp; Secretarial Practice</p>
      </header>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === "bot" && <div className="bot-avatar"><BotIcon /></div>}
            <span className="bubble">{msg.text}</span>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div className="bot-avatar"><BotIcon /></div>
            <span className="bubble typing">Thinking</span>
          </div>
        )}

        {messages.length === 1 && (
          <div className="suggested-prompts-container">
            <h3>Quick Start Compliance Prompts</h3>
            <div className="suggested-prompts-grid">
              {suggestedPrompts.map((item, idx) => (
                <button
                  key={idx}
                  className="prompt-card"
                  onClick={() => {
                    setInput(item.prompt);
                    // Focus the textarea
                    document.getElementById("chat-textarea")?.focus();
                  }}
                >
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="footer">
        &copy; {new Date().getFullYear()} Rohit's AI. All rights reserved.
      </div>

      <SignedIn>
        <div className="input-area">
          <textarea
            id="chat-textarea"
            rows={1}
            placeholder="Ask a Company Secretary question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} title="Send Message">
            <SendIcon />
            <span>Send</span>
          </button>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="signed-out-panel">
          <p>Sign in to start chatting with Rohit's AI.</p>
          <div className="signed-out-actions">
            <SignInButton mode="modal">
              <button className="auth-button auth-button-ghost" type="button">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="auth-button" type="button">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
