# Google OAuth Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for your quiz application using Supabase.

## Prerequisites

- A Supabase account and project
- A Google Cloud Platform account
- Your application running locally or deployed

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit https://console.cloud.google.com
2. Sign in with your Google account
3. Create a new project or select an existing one:
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Quiz App OAuth")
   - Click "Create"

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on **Google+ API** or **Google Identity Services API**
4. Click **Enable**

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: QuiziFy (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On **Scopes** page, click **Save and Continue** (no scopes needed for basic auth)
7. On **Test users** page, add your email if testing, then click **Save and Continue**
8. Review and click **Back to Dashboard**

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application** as the application type
4. Give it a name (e.g., "QuiziFy Web Client")
5. **Authorized JavaScript origins** - Add these URLs:
   ```
   http://localhost:3000
   http://localhost:5173
   https://your-production-domain.com
   ```
   (Add your actual production domain when deploying)

6. **Authorized redirect URIs** - Add these URLs:
   ```
   https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback
   ```
   (Replace with your Supabase project URL)

7. Click **Create**
8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## Step 2: Configure Supabase Google Provider

### 2.1 Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON** (enable it)

### 2.2 Add Google OAuth Credentials

1. In the Google provider settings, you'll see fields for:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret

2. Click **Save**

### 2.3 Configure Redirect URLs

Supabase automatically handles redirect URLs, but verify:
- Your Supabase project URL is: `https://xfbkixpdssbyzgucwasf.supabase.co`
- The callback URL should be: `https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback`
- Make sure this exact URL is in your Google Cloud Console redirect URIs

## Step 3: Update Your Application

The code has been updated to include:
- Google sign-in button in LoginScreen
- Google sign-in button in RegisterScreen
- OAuth authentication handler in authService
- Automatic user data retrieval after Google login

## Step 4: Test Google OAuth

1. Start your development server: `npm run dev`
2. Go to the login or register page
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. Sign in with your Google account
6. You'll be redirected back to your app
7. You should be logged in automatically

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback`

### Error: "Invalid client"
- **Solution**: Double-check your Client ID and Client Secret in Supabase settings

### Error: "Access blocked"
- **Solution**: Make sure your app is published in OAuth consent screen, or add your email as a test user

### OAuth works but user not logged in
- **Solution**: Check browser console for errors
- Verify the redirect URL is correct
- Make sure Supabase Auth is properly configured

## Security Notes

1. **Never commit** your Client Secret to version control
2. The Client Secret is stored securely in Supabase
3. OAuth tokens are handled by Supabase automatically
4. User data is protected by Row Level Security (RLS)

## Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** in Google Cloud Console:
   ```
   https://your-production-domain.com
   ```

2. The redirect URI stays the same (Supabase handles it):
   ```
   https://xfbkixpdssbyzgucwasf.supabase.co/auth/v1/callback
   ```

3. Update your OAuth consent screen to "Published" status

4. Test the OAuth flow in production

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Social Auth Guide](https://supabase.com/docs/guides/auth/social-login)

