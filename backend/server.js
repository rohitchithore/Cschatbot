require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/chat — receives user message, returns AI response
app.post("/api/chat", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key is not configured." });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      instructions:
        "You are an expert Indian Company Secretary. Provide clear, practical and legally aware answers.",
      input: message,
      max_output_tokens: 200,
    });

    const reply = response.output_text;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "Failed to get response from Rohit's AI. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
