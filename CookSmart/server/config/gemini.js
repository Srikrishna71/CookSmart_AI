const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set — AI features will fail at runtime");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Returns a configured Gemini model instance.
 * Using gemini-1.5-flash: fast, cost-effective, supports JSON mode.
 */
const getGeminiModel = () =>
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

module.exports = { getGeminiModel };
