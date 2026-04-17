export const getGeminiApiKey = (): string => {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!geminiApiKey) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Add it to .env.local for local development and in Vercel project environment variables for deployment."
    );
  }

  return geminiApiKey;
};
