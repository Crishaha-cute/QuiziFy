export const getGeminiApiKey = (): string => {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!geminiApiKey) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Add it to .env.local for local development and in Vercel project environment variables for deployment."
    );
  }

  const looksLikeGeminiApiKey = /^AIza[0-9A-Za-z_-]{20,}$/.test(geminiApiKey);
  if (!looksLikeGeminiApiKey) {
    throw new Error(
      "Invalid Gemini API key format. Use an API key from Google AI Studio (usually starts with 'AIza')."
    );
  }

  return geminiApiKey;
};
