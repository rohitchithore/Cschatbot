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

// SVG Icon Components for Premium Legal-Tech Dashboard
const ScalesIcon = () => (
  <svg className="svg-icon scale-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const BookOpenIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
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

// Helper to format basic markdown elements (like **bold**) into JSX elements
const formatMessageText = (text) => {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

export default function App() {
  const { user } = useUser();
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm Rohit's AI. Ask me anything about Indian Company Law." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const typeMessage = (fullText) => {
    return new Promise((resolve) => {
      const tokens = fullText.match(/\S+|\s+/g) || [];
      let currentText = "";
      let tokenIndex = 0;

      setMessages((prev) => [...prev, { role: "bot", text: "" }]);

      const interval = setInterval(() => {
        if (tokenIndex < tokens.length) {
          currentText += tokens[tokenIndex];
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "bot", text: currentText };
            return updated;
          });
          tokenIndex++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 15);
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || isTyping) return;

    const userMsg = { role: "user", text };
    const history = messages.map((msg) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.text,
    }));
    history.push({ role: "user", content: text });

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const API = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "No response received.";
      
      setLoading(false);
      setIsTyping(true);
      await typeMessage(reply);
    } catch {
      setLoading(false);
      setMessages((prev) => [...prev, { role: "bot", text: "Error: Could not reach the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        sendMessage();
      }
    }
  };

  const handleNewChat = () => {
    setMessages([
      { role: "bot", text: "Hello! I'm Rohit's AI. Ask me anything about Indian Company Law." },
    ]);
    setInput("");
    setSidebarOpen(false);
  };

  const handleCategoryClick = (categoryPrompt) => {
    setInput(categoryPrompt);
    document.getElementById("chat-textarea")?.focus();
    setSidebarOpen(false);
  };

  const displayName =
    user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "User";

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile Viewports */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Collapsible Left Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <ScalesIcon />
            <h2>Rohit's AI</h2>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <button className="new-chat-button" onClick={handleNewChat}>
          <PlusIcon />
          <span>New Chat</span>
        </button>

        <div className="sidebar-sections">
          <div className="sidebar-section">
            <h3>Compliance Guides</h3>
            <ul className="resource-list">
              <li>
                <button onClick={() => handleCategoryClick("What is the step-by-step process to incorporate a Private Limited Company in India?")}>
                  <BookOpenIcon />
                  <span>Incorporation Guide</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("What are the rules and due dates for holding an Annual General Meeting (AGM) under the Companies Act 2013?")}>
                  <BookOpenIcon />
                  <span>AGM Compliance</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("What is the procedure for the resignation of a director in an Indian company?")}>
                  <BookOpenIcon />
                  <span>Director Resignation</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("What are the legal requirements and procedure for the transfer of shares under the Companies Act 2013?")}>
                  <BookOpenIcon />
                  <span>Share Transfer Guide</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar Footer User Account info */}
        <div className="sidebar-footer">
          <SignedOut>
            <div className="sidebar-auth">
              <SignInButton mode="modal">
                <button className="auth-button auth-button-ghost w-full" type="button">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="auth-button w-full" type="button">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="sidebar-user">
              <UserButton />
              <div className="user-info">
                <strong>{displayName}</strong>
                <span>Professional Account</span>
              </div>
            </div>
          </SignedIn>
        </div>
      </aside>

      {/* Main Chat Console */}
      <main className="main-content">
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </button>
          
          <div className="chat-header-title">
            <h2>CS Compliance Assistant</h2>
            <p>Indian Company Law &amp; Secretarial Practice</p>
          </div>

          <div className="chat-header-actions">
            <span className="status-badge">Compliance Mode</span>
          </div>
        </header>

        {/* Message Log Viewport */}
        <div className="chat-viewport">
          <div className="chat-messages-container">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-content-wrapper">
                  <div className="avatar-slot">
                    {msg.role === "bot" ? (
                      <div className="bot-avatar-badge"><BotIcon /></div>
                    ) : (
                      <div className="user-avatar-badge">{displayName[0].toUpperCase()}</div>
                    )}
                  </div>
                  <div className="bubble-text-wrapper">
                    <span className="bubble-author">
                      {msg.role === "bot" ? "Rohit's AI" : "You"}
                    </span>
                    <div className="bubble-body">{formatMessageText(msg.text)}</div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row bot">
                <div className="message-content-wrapper">
                  <div className="avatar-slot">
                    <div className="bot-avatar-badge"><BotIcon /></div>
                  </div>
                  <div className="bubble-text-wrapper">
                    <span className="bubble-author">Rohit's AI</span>
                    <div className="bubble-body typing">Thinking</div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="welcome-prompt-area">
                <div className="welcome-prompt-header">
                  <h3>Quick Start Compliance Prompts</h3>
                  <p>Select a scenario to begin generating guidance</p>
                </div>
                <div className="suggested-prompts-grid">
                  {suggestedPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      className="prompt-card"
                      onClick={() => {
                        setInput(item.prompt);
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
        </div>

        {/* Input Bar Overlay */}
        <div className="chat-input-wrapper">
          <div className="chat-input-container-inner">
            <SignedIn>
              <div className="input-area-inner">
                <textarea
                  id="chat-textarea"
                  rows={1}
                  placeholder="Ask a Company Secretary question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading || isTyping}
                />
                <button className="send-btn" onClick={sendMessage} disabled={loading || isTyping || !input.trim()} title="Send Message">
                  <SendIcon />
                </button>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="signed-out-prompt">
                <p>Sign in to start compliance chat with Rohit's AI.</p>
                <div className="signed-out-buttons">
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

            {/* Anchored Footer Copyright */}
            <div className="chat-footer">
              &copy; {new Date().getFullYear()} Rohit's AI. All rights reserved. Indian Company Law &amp; Secretarial Compliance Assistant.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
