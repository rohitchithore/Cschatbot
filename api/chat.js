const OpenAI = require("openai");

const SYSTEM_PROMPT =
  "You are an expert Indian Company Secretary. Provide clear, practical and legally aware answers.";
const MODEL_NAME = process.env.AICREDITS_MODEL || "deepseek/deepseek-chat";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.AICREDITS_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AICredits API key is not configured." });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.aicredits.in/v1",
    });
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });
    const reply =
      completion.choices?.[0]?.message?.content || "No response received.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("AICredits error:", err.message);
    res.status(500).json({ error: "Failed to get response from Rohit's AI. Please try again." });
  }
};
