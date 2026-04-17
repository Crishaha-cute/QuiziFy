# Supabase Integration Setup Guide

This guide will walk you through setting up Supabase for your quiz application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase Project URL and anon public API key

## Step 1: Install Dependencies

The Supabase JavaScript client has already been installed. If you need to reinstall:

```bash
npm install @supabase/supabase-js
```

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)

2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these values:**
- Go to your Supabase project dashboard: https://app.supabase.com
- Navigate to **Settings** → **API**
- Copy the **Project URL** and paste it as `VITE_SUPABASE_URL`
- Copy the **anon public** key and paste it as `VITE_SUPABASE_ANON_KEY`

**Important:** 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- The anon key is safe to use in the frontend as it's protected by Row Level Security (RLS)

## Step 3: Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Open the file `database/schema.sql` from this project
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL Editor in Supabase
6. Click **Run** to execute the SQL script

This will create:
- `quiz_history` table - stores quiz attempt history
- `quiz_attempts` table - stores detailed question-by-question results (optional)
- `uploaded_files` table - stores metadata about uploaded files
- Row Level Security (RLS) policies to ensure users can only access their own data
- Helper views and functions

## Step 4: Verify the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try registering a new user account
3. Complete a quiz and verify it's saved to the database

## Step 5: Test Database Connection

You can verify the connection by checking the browser console. If there are any errors, they will be displayed there.

## Project Structure

```
QUIZ_APP_DSA/
├── services/
│   ├── supabase.ts          # Supabase client configuration
│   ├── authService.ts       # Authentication using Supabase Auth
│   └── historyService.ts    # Quiz history using Supabase Database
├── database/
│   ├── schema.sql           # Database schema and RLS policies
│   └── types.ts             # TypeScript types for database
└── .env                     # Environment variables (create this)
```

## How It Works

### Authentication

The app uses Supabase Auth for user authentication:
- **Registration**: Creates a new user account with email/password
- **Login**: Authenticates existing users
- **Session Management**: Automatically handled by Supabase (stored in localStorage)
- **Security**: Passwords are hashed server-side, never stored in plain text

### Database Storage

Quiz history is stored in Supabase:
- Each quiz attempt is saved to the `quiz_history` table
- Row Level Security ensures users can only see their own data
- Data is automatically synced across devices for the same user

### Security Best Practices

1. **Environment Variables**: Sensitive keys are stored in `.env` files, not in code
2. **Row Level Security**: Database policies prevent unauthorized access
3. **Anon Key**: Safe for frontend use because of RLS restrictions
4. **Service Role Key**: Never expose this key in frontend code (only for backend/server use)

## Troubleshooting

### "Missing VITE_SUPABASE_URL" Error

- Make sure you created a `.env` file in the project root
- Verify the variable names start with `VITE_`
- Restart your development server after creating/updating `.env`

### "User not found" or Authentication Errors

- Verify your Supabase project is active
- Check that the database schema has been created (Step 3)
- Ensure email confirmation is disabled in Supabase Auth settings (for development)

### Database Query Errors

- Verify the SQL schema was executed successfully
- Check that Row Level Security policies are enabled
- Ensure you're logged in before trying to save/retrieve data

## Next Steps

- **Email Confirmation**: Enable email verification in Supabase Auth settings
- **Social Logins**: Add Google, GitHub, etc. authentication
- **Real-time Updates**: Use Supabase real-time subscriptions for live updates
- **File Storage**: Use Supabase Storage for uploaded files instead of processing in memory

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

