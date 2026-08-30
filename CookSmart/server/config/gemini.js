const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set — AI features will fail at runtime");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Returns a configured Gemini model instance.
 *
 * Model: gemini-2.5-flash — fast, cost-effective, supports JSON mode.
 *
 * maxOutputTokens: 4096
 *   A full recipe JSON (title, 15 ingredients, 10 steps, nutrition, tags)
 *   can reach 1,800–2,200 tokens in complex dishes (e.g. Chole Bhature,
 *   Masala Dosa). The prompt itself is ~300 tokens. At 2048 the output
 *   was being truncated mid-JSON for these recipes, causing parse failures.
 *   4096 gives comfortable headroom without a significant cost increase on
 *   Flash pricing.
 *
 * responseMimeType: "application/json"
 *   Instructs Gemini to return raw JSON. The model still sometimes adds
 *   markdown fences or preamble text despite this setting, which is why
 *   the parser in aiController.js also handles those defensively.
 */
const getGeminiModel = () =>
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

module.exports = { getGeminiModel };