# Troubleshooting: Login and Database Issues

## Issue: Cannot Login / Data Not Appearing in Database

### Step 1: Register a New Account First

**You must register before you can login!**

1. On the login screen, click "Sign up" or "Create account"
2. Enter your email and password (minimum 8 characters)
3. Click "Sign Up"
4. After successful registration, you'll be redirected to the login screen
5. Now you can login with the credentials you just created

### Step 2: Set Up Database Schema in Supabase

The database tables need to be created in Supabase before data can be saved.

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (xfbkixpdssbyzgucwasf)
3. **Click "SQL Editor"** in the left sidebar
4. **Click "New Query"**
5. **Open the file** `database/schema.sql` from your project
6. **Copy the ENTIRE contents** of the file
7. **Paste it into the SQL Editor**
8. **Click "Run"** (or press Ctrl+Enter)

You should see a success message. The following tables will be created:
- `quiz_history` - for storing quiz attempts
- `quiz_attempts` - for detailed question results
- `uploaded_files` - for file metadata

### Step 3: Disable Email Confirmation (For Development)

By default, Supabase may require email confirmation. For development, disable it:

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Authentication"** in the left sidebar
3. **Click "Providers"** tab
4. **Find "Email"** provider
5. **Toggle OFF "Confirm email"** (or set it to disabled)
6. **Click "Save"**

This allows you to login immediately after registration without email verification.

### Step 4: Verify Your Setup

1. **Check Browser Console** (F12 → Console tab)
   - Look for any error messages
   - Common errors:
     - "Invalid login credentials" → You need to register first
     - "Email not confirmed" → Disable email confirmation (Step 3)
     - Database errors → Run the schema SQL (Step 2)

2. **Test the Flow**:
   - Register a new account
   - Login with that account
   - Complete a quiz
   - Check Supabase Dashboard → Table Editor → `quiz_history` to see if data appears

### Step 5: Check Database Tables

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Table Editor"** in the left sidebar
3. **You should see**:
   - `quiz_history`
   - `quiz_attempts`
   - `uploaded_files`
4. **If tables don't exist**: Go back to Step 2 and run the SQL schema

### Common Errors and Solutions

#### Error: "Invalid login credentials"
- **Solution**: You need to register first. You can't login with an account that doesn't exist.

#### Error: "Email not confirmed"
- **Solution**: Disable email confirmation in Supabase Auth settings (Step 3)

#### Error: "relation does not exist" or "table does not exist"
- **Solution**: Run the database schema SQL (Step 2)

#### Error: "permission denied" or "RLS policy violation"
- **Solution**: Make sure you're logged in before trying to save data

#### Data not appearing in database
- **Check**: Did you complete a quiz? Data is only saved when you finish a quiz.
- **Check**: Are you logged in? You must be authenticated to save data.
- **Check**: Did you run the schema SQL? Tables must exist first.

### Quick Test Checklist

- [ ] Created `.env` file with Supabase credentials
- [ ] Restarted dev server after creating `.env`
- [ ] Registered a new account (not just tried to login)
- [ ] Ran database schema SQL in Supabase SQL Editor
- [ ] Disabled email confirmation in Supabase Auth settings
- [ ] Completed a quiz while logged in
- [ ] Checked Supabase Table Editor for data

### Still Having Issues?

1. **Check Browser Console** for specific error messages
2. **Check Supabase Dashboard** → Logs for server-side errors
3. **Verify** your `.env` file has the correct values
4. **Make sure** you're using the correct Supabase project

