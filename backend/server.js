require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const SYSTEM_PROMPT =
  "You are an expert Indian Company Secretary. Provide clear, practical and legally aware answers.";
const MODEL_NAME = process.env.AICREDITS_MODEL || "deepseek/deepseek-chat";
const apiKey = process.env.AICREDITS_API_KEY || process.env.GEMINI_API_KEY;
const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://api.aicredits.in/v1",
    })
  : null;

// POST /api/chat — receives user message, returns AI response
app.post("/api/chat", async (req, res) => {
  if (!apiKey || !client) {
    return res.status(500).json({
      error: "AICredits API key is not configured.",
    });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });
    const reply =
      completion.choices?.[0]?.message?.content || "No response received.";
    res.json({ reply });
  } catch (err) {
    console.error("AICredits error:", err.message);
    res.status(500).json({ error: "Failed to get response from Rohit's AI. Please try again." });
  }
});

// Serve React frontend build
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch-all: serve index.html for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
