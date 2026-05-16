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
            <h1>⚖️ Rohit's AI</h1>
            <div className="dhruvi-badge">✨ Specially built for Dhruvi 💕</div>
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
            {msg.role === "bot" && <div className="bot-avatar">⚖️</div>}
            <span className="bubble">{msg.text}</span>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div className="bot-avatar">⚖️</div>
            <span className="bubble typing">Thinking</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="footer">
        Made with <span>♥</span> for Dhruvi
      </div>

      <SignedIn>
        <div className="input-area">
          <textarea
            rows={2}
            placeholder="Ask a Company Secretary question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
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
