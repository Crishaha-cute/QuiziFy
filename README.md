<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` and add your key:
   `VITE_GEMINI_API_KEY=your_new_gemini_key`
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Open your Vercel project dashboard.
2. Go to **Settings -> Environment Variables**.
3. Add this variable for the environments you use (Production, Preview, Development):
   - `VITE_GEMINI_API_KEY` = your Gemini API key
4. Redeploy the project so Vite rebuilds with the new environment variable.

## Security and key rotation

If a key is leaked and Gemini returns a 403 with "reported as leaked":

1. Revoke/delete the leaked key in Google AI Studio immediately.
2. Generate a new API key in Google AI Studio.
3. Update your local `.env.local` with the new `VITE_GEMINI_API_KEY`.
4. Update Vercel environment variable `VITE_GEMINI_API_KEY`.
5. Redeploy and verify quiz generation works.
