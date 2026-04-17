# Supabase Integration - Quick Reference

## 📁 Folder Structure

```
QUIZ_APP_DSA/
├── services/
│   ├── supabase.ts              # ✅ Supabase client initialization
│   ├── supabase-examples.ts     # 📚 Example usage patterns
│   ├── authService.ts           # ✅ Updated to use Supabase Auth
│   └── historyService.ts        # ✅ Updated to use Supabase Database
├── database/
│   ├── schema.sql               # ✅ Database schema and RLS policies
│   └── types.ts                 # ✅ TypeScript types for type safety
├── .env                         # ⚠️ Create this file with your credentials
└── SUPABASE_SETUP.md           # 📖 Detailed setup instructions
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```
✅ Already done!

### 2. Create `.env` File
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/schema.sql`
3. Paste and run in SQL Editor

### 4. Start Development
```bash
npm run dev
```

## 🔑 Key Files

### `services/supabase.ts`
- Initializes Supabase client
- Uses environment variables for configuration
- Provides type-safe client with Database types

### `services/authService.ts`
- `login(email, password)` - Authenticate user
- `register(email, password)` - Create new user
- `logout()` - Sign out user
- `getCurrentUser()` - Get authenticated user
- `onAuthStateChange(callback)` - Listen to auth changes

### `services/historyService.ts`
- `getHistory()` - Get user's quiz history
- `saveHistory(topic, difficulty, score, totalQuestions)` - Save quiz attempt
- `deleteHistory(historyId)` - Delete a history entry
- `getQuizStats()` - Get user statistics

## 🗄️ Database Schema

### Tables Created:
1. **quiz_history** - Stores quiz attempt summaries
2. **quiz_attempts** - Stores detailed question-by-question results
3. **uploaded_files** - Stores file upload metadata

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Policies automatically enforced by Supabase

## 📝 Usage Examples

### Authentication
```typescript
import * as authService from './services/authService';

// Register
const user = await authService.register('user@example.com', 'password123');

// Login
const user = await authService.login('user@example.com', 'password123');

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
```

### Database Operations
```typescript
import * as historyService from './services/historyService';

// Save quiz history
await historyService.saveHistory('JavaScript', 'Medium', 8, 10);

// Get quiz history
const history = await historyService.getHistory();

// Get statistics
const stats = await historyService.getQuizStats();
```

### Direct Supabase Client Usage
```typescript
import { supabase } from './services/supabase';

// Insert data
const { data, error } = await supabase
  .from('quiz_history')
  .insert({ topic: 'React', difficulty: 'Hard', score: 9, total_questions: 10 });

// Query data
const { data, error } = await supabase
  .from('quiz_history')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

## 🔒 Security Best Practices

1. ✅ **Environment Variables**: All sensitive keys in `.env` file
2. ✅ **RLS Policies**: Database-level security enforced
3. ✅ **Anon Key**: Safe for frontend (protected by RLS)
4. ✅ **Never Expose**: Service role key never in frontend code
5. ✅ **Type Safety**: TypeScript types prevent errors

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Missing VITE_SUPABASE_URL" | Create `.env` file with credentials |
| "User not found" | Check Supabase project is active |
| Database errors | Verify schema.sql was executed |
| RLS policy errors | Ensure user is authenticated |

## 📚 Additional Resources

- See `SUPABASE_SETUP.md` for detailed setup instructions
- See `services/supabase-examples.ts` for code examples
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

