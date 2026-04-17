# Mobile OAuth Fix - Accessing App via Network IP

## Problem

Google OAuth works on PC but fails on mobile devices with "this site can't be reached" error. This happens because mobile devices can't access `localhost` - it refers to the mobile device itself, not your development machine.

## Solution

Access your app via your **network IP address** instead of `localhost` on mobile devices.

## Step-by-Step Fix

### Step 1: Find Your Computer's IP Address

**On Windows:**
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. It will look like: `192.168.1.xxx` or `192.168.0.xxx`

**On Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your network interface (usually `en0` or `wlan0`)
4. Find the `inet` address (e.g., `192.168.1.xxx`)

### Step 2: Start Your Dev Server

Make sure your Vite dev server is running:
```bash
npm run dev
```

The server should be accessible on `0.0.0.0:3000` (already configured in `vite.config.ts`).

### Step 3: Access from Mobile Device

**On your mobile device:**

1. Make sure your mobile device is on the **same Wi-Fi network** as your computer
2. Open a browser on your mobile device
3. Instead of `localhost:3000`, use your computer's IP address:
   ```
   http://192.168.1.xxx:3000
   ```
   (Replace `xxx` with your actual IP address)

### Step 4: Update Google Cloud Console (If Needed)

If you're testing OAuth on mobile, you may need to add your network IP to Google Cloud Console:

1. Go to Google Cloud Console → **Credentials** → Your OAuth Client
2. Under **Authorized JavaScript origins**, add:
   ```
   http://192.168.1.xxx:3000
   ```
   (Replace with your actual IP)

3. Click **Save**

### Step 5: Test OAuth on Mobile

1. Access your app via `http://192.168.1.xxx:3000` on mobile
2. Click "Continue with Google"
3. OAuth should now work correctly!

## Alternative: Use ngrok for Testing (Advanced)

If you want a public URL for testing (useful for testing on different networks):

1. Install ngrok: https://ngrok.com/
2. Run: `ngrok http 3000`
3. Use the ngrok URL (e.g., `https://abc123.ngrok.io`)
4. Add this URL to Google Cloud Console authorized origins

## Production Deployment

When deploying to production, this issue won't occur because:
- Your app will have a real domain (not localhost)
- The redirect URL will be your production URL
- Mobile devices can access it normally

## Quick Checklist

- [ ] Find your computer's IP address (`ipconfig` or `ifconfig`)
- [ ] Make sure mobile device is on same Wi-Fi network
- [ ] Access app via `http://YOUR_IP:3000` on mobile
- [ ] Add IP to Google Cloud Console authorized origins (if needed)
- [ ] Test Google OAuth on mobile

## Troubleshooting

**Still can't access on mobile?**
- Check firewall settings on your computer
- Make sure both devices are on the same network
- Try disabling VPN if active
- Check if port 3000 is accessible

**OAuth redirect fails?**
- Make sure the redirect URL in Google Console matches what you're using
- Check browser console for specific error messages
- Verify Supabase redirect URL is correct

