import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./keys";

// Initialize the GoogleGenAI client with API key
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Default chat model
const DEFAULT_MODEL = "gemini-2.5-flash";

// Small compatibility wrapper that exposes `generateContent` with a
// consistent return shape used by the app (response.response.text())
export const chatSession = {
  generateContent: async ({ model = DEFAULT_MODEL, contents } = {}) => {
    // Some versions of the client expose `models.generateContent`
    // and return different response shapes. Normalize to an object
    // with `response.text()` to avoid touching callers.
    const result = await ai.models.generateContent({ model, contents });

    // Normalize text extraction from known shapes
    let text = null;
    if (typeof result === "string") {
      text = result;
    } else if (result?.text) {
      // e.g. { text: '...' }
      text = result.text;
    } else if (Array.isArray(result?.output) && result.output[0]?.content) {
      text = result.output[0].content;
    } else if (result?.candidates && result.candidates[0]?.content) {
      text = result.candidates[0].content;
    } else if (result?.output_text) {
      text = result.output_text;
    } else {
      text = JSON.stringify(result);
    }

    return { response: { text: () => text } };
  },
};

export default chatSession;
