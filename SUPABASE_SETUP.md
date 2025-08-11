# Supabase Setup Instructions

## 1. Disable Email Confirmation (for instant signup)

Go to your Supabase Dashboard → Authentication → Settings → Email Auth

**Turn OFF "Enable email confirmations"**

This allows users to sign up and be immediately authenticated without email verification.

## 2. Configure Site URL

Go to Authentication → URL Configuration:
- **Site URL**: `http://localhost:5173` (for development)
- **Redirect URLs**: Add `http://localhost:5173/**`

## 3. Enable Google OAuth (Optional)

Go to Authentication → Providers → Google:
1. Enable Google provider
2. Add your Google OAuth credentials
3. Add authorized domains

## 4. Database Setup

The user_profiles table should already be created. If not, run this SQL:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  credits INTEGER DEFAULT 5,
  credits_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_completed BOOLEAN DEFAULT FALSE,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium'))
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 5. Test Authentication

1. Try signing up with a new email
2. User should be immediately logged in
3. Check if profile is created in user_profiles table
4. Test sign out and sign in again