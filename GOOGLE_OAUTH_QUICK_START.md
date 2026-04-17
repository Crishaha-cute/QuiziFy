# Google OAuth - Quick Start

## ✅ What's Been Implemented

1. ✅ Google OAuth authentication function in `authService.ts`
2. ✅ "Continue with Google" button in LoginScreen
3. ✅ "Continue with Google" button in RegisterScreen
4. ✅ OAuth callback handler in App.tsx
5. ✅ Automatic user data retrieval after Google login
6. ✅ Error handling and loading states

## 🚀 Setup Steps (5 minutes)

### Step 1: Google Cloud Console (3 minutes)

1. Go to https://console.cloud.google.com
2. Create/select a project
3. Enable **Google+ API** or **Google Identity Services API**
4. Go to **OAuth consent screen** → Configure → Save
5. Go to **Credentials** → **Create OAuth client ID**
6. Choose **Web application**
7. Add **Authorized redirect URI**:
   ```
   https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**

### Step 2: Supabase Configuration (2 minutes)

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** → Toggle **ON**
3. Paste **Client ID** and **Client Secret**
4. Click **Save**

### Step 3: Test

1. Run `npm run dev`
2. Click "Continue with Google" on login/register page
3. Sign in with Google
4. You'll be redirected back and logged in automatically!

## 📝 Important URLs

**Redirect URI for Google Cloud Console:**
```
https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback
```

**Authorized JavaScript Origins (for production):**
```
http://localhost:3000
http://localhost:5173
https://your-production-domain.com
```

## 🔧 Code Files Modified

- `services/authService.ts` - Added `signInWithGoogle()` and `handleOAuthCallback()`
- `components/LoginScreen.tsx` - Added Google button
- `components/RegisterScreen.tsx` - Added Google button
- `App.tsx` - Added OAuth callback handler

## 🐛 Troubleshooting

**"redirect_uri_mismatch"**
- Make sure redirect URI in Google Console exactly matches:
  `https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback`

**"Invalid client"**
- Double-check Client ID and Client Secret in Supabase

**Button doesn't work**
- Check browser console for errors
- Verify Google provider is enabled in Supabase
- Make sure credentials are saved in Supabase

## 📚 Full Documentation

See `GOOGLE_OAUTH_SETUP.md` for detailed step-by-step instructions.

