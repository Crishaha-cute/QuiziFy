# Fix: Registration Not Working

## Quick Fix Steps

### Step 1: Disable Email Confirmation in Supabase

**This is the most common issue!** Supabase requires email confirmation by default.

1. Go to https://app.supabase.com
2. Select your project
3. Click **"Authentication"** in the left sidebar
4. Click **"Providers"** tab
5. Find **"Email"** provider (should be at the top)
6. Scroll down to **"Confirm email"** setting
7. **Toggle it OFF** (disable it)
8. Click **"Save"**

### Step 2: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try to register again
4. Look for any error messages
5. Share the error message if you see one

### Step 3: Verify Supabase Connection

Check if your `.env` file has the correct values:

```env
VITE_SUPABASE_URL=https://xfbkixpdssbyzgucwasf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Make sure:
- No extra spaces
- No quotes around the values
- Values are on separate lines

### Step 4: Test Registration Flow

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev` again
3. **Try registering** with:
   - A valid email (e.g., test@example.com)
   - Password at least 8 characters
4. **Check console** for any errors

### Step 5: Check Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. See if your user appears there after registration
3. If user appears but you can't login:
   - The user might need email confirmation
   - Or the password might be wrong

## Common Error Messages

### "User already registered"
- **Solution**: Try logging in instead, or use a different email

### "Email not confirmed"
- **Solution**: Disable email confirmation (Step 1) OR check your email inbox

### "Invalid email"
- **Solution**: Use a valid email format (e.g., user@example.com)

### "Password does not meet requirements"
- **Solution**: Use a password with at least 6 characters (8+ recommended)

### Network/CORS errors
- **Solution**: Check your `.env` file has the correct Supabase URL

## Still Not Working?

1. **Open Browser Console** (F12 → Console)
2. **Try to register**
3. **Copy the exact error message** you see
4. Check if the error appears in:
   - Browser console
   - Network tab (F12 → Network → look for failed requests)
   - Supabase Dashboard → Logs

## Debug Mode

The updated code now logs to console. Check the browser console for:
- "Attempting to register user: [email]"
- "Registration successful: [user-id]"
- Or any error messages

This will help identify where the registration is failing.

