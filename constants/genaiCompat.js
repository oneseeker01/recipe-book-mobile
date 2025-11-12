import { GEMINI_API_KEY } from "./keys";

/**
 * Lightweight compatibility wrapper for two Gen AI libraries:
 * - @google/genai (user-provided snippet)
 * - @google/generative-ai (used elsewhere in project)
 *
 * Exports:
 * - generateContent({ model, contents }) => Promise<string>
 * - generateChatReply(chatModelInstance, text) => Promise<string>
 */

export async function generateContent({
  model = "gemini-2.5-flash",
  contents = "",
} = {}) {
  // Try to load the user's preferred package '@google/genai' dynamically.
  try {
    const genai = await import("@google/genai");
    const GoogleGenAI =
      genai.GoogleGenAI || genai.default?.GoogleGenAI || genai.default;
    if (!GoogleGenAI) throw new Error("@google/genai export not found");

    // Initialize with API key if constructor accepts it
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use generateContent as the user's snippet expects
    if (ai.models && typeof ai.models.generateContent === "function") {
      const response = await ai.models.generateContent({ model, contents });
      // response.text is commonly used in examples, but fallback to other shapes
      return (
        response?.text || response?.output?.[0]?.content || String(response)
      );
    }

    throw new Error(
      "generateContent method not available on @google/genai client"
    );
  } catch (e) {
    // Fallback: use the existing generative client (if available)
    try {
      const { chatSession } = await import("./geminiClient");
      const chat = chatSession.startChat({
        history: [{ role: "user", parts: [{ text: contents }] }],
      });
      const result = await chat.sendMessage(contents);
      return result.response.text();
    } catch (fallbackErr) {
      // Re-throw original error if fallback also fails
      throw fallbackErr || e;
    }
  }
}

export async function generateChatReply(text, options = {}) {
  // Small helper that uses same fallback strategy but focused on chat responses
  return generateContent({
    model: options.model || "gemini-1.5-flash",
    contents: text,
  });
}

export default { generateContent, generateChatReply };
