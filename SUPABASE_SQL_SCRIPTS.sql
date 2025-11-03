-- Supabase Database Schema Setup
-- Run these scripts in Supabase SQL Editor: https://supabase.com/dashboard/project/xonqvbehrqgmlqnygeou/sql

-- ============================================
-- STEP 1: Enable UUID Extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: Create Profiles Table
-- ============================================
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to check if user is admin (bypasses RLS)
-- Drop existing function if any
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND is_admin = TRUE
  );
END;
$$;

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin_user());

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (public.is_admin_user());

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 3: Create Wedding Plans Table
-- ============================================
CREATE TABLE IF NOT EXISTS wedding_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  guest_count INTEGER NOT NULL,
  budget INTEGER NOT NULL,
  venue_type TEXT NOT NULL,
  season TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_plans_user_id ON wedding_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_plans_created_at ON wedding_plans(created_at DESC);

-- Enable RLS
ALTER TABLE wedding_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own plans" ON wedding_plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON wedding_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON wedding_plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON wedding_plans;
DROP POLICY IF EXISTS "Admins can read all plans" ON wedding_plans;

-- Policy: Users can read their own plans
CREATE POLICY "Users can read own plans"
  ON wedding_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own plans
CREATE POLICY "Users can insert own plans"
  ON wedding_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own plans
CREATE POLICY "Users can update own plans"
  ON wedding_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own plans
CREATE POLICY "Users can delete own plans"
  ON wedding_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can read all plans
CREATE POLICY "Admins can read all plans"
  ON wedding_plans FOR SELECT
  USING (public.is_admin_user());

-- ============================================
-- STEP 4: Create Chat Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can read all messages" ON chat_messages;

-- Policy: Users can read their own messages
CREATE POLICY "Users can read own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all messages
CREATE POLICY "Admins can read all messages"
  ON chat_messages FOR SELECT
  USING (public.is_admin_user());

-- ============================================
-- STEP 5: Create Venues Table
-- ============================================
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  price INTEGER NOT NULL,
  guests TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(type);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read active venues" ON venues;
DROP POLICY IF EXISTS "Admins can manage venues" ON venues;

-- Policy: Anyone can read active venues
CREATE POLICY "Public can read active venues"
  ON venues FOR SELECT
  USING (is_active = TRUE);

-- Policy: Admins can manage venues
CREATE POLICY "Admins can manage venues"
  ON venues FOR ALL
  USING (public.is_admin_user());

-- ============================================
-- DONE! ✅
-- ============================================
-- Semua tables sudah dibuat dengan RLS policies
-- Next step: Setup authentication UI di aplikasi

