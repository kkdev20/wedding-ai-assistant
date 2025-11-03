-- ============================================
-- CONTENT MANAGEMENT TABLES
-- ============================================

-- Table: AI Prompts (for managing AI chat system prompts)
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- Prompt name/identifier
  category TEXT NOT NULL, -- e.g., 'chat', 'recommendations', 'planner'
  prompt_text TEXT NOT NULL, -- The actual prompt
  variables JSONB, -- Variables that can be replaced (e.g., {guestCount}, {budget})
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1, -- Version for tracking changes
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for AI prompts
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_prompts_name ON ai_prompts(name);

-- Table: Wedding Tips
CREATE TABLE IF NOT EXISTS wedding_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Can be markdown or HTML
  category TEXT NOT NULL, -- e.g., 'budget', 'venue', 'timeline', 'vendor'
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'id')),
  display_order INTEGER DEFAULT 0, -- For sorting tips
  is_active BOOLEAN DEFAULT true,
  image_url TEXT, -- Optional image URL
  tags TEXT[], -- Array of tags
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for wedding tips
CREATE INDEX IF NOT EXISTS idx_wedding_tips_category ON wedding_tips(category);
CREATE INDEX IF NOT EXISTS idx_wedding_tips_language ON wedding_tips(language);
CREATE INDEX IF NOT EXISTS idx_wedding_tips_active ON wedding_tips(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wedding_tips_order ON wedding_tips(display_order);

-- Table: Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly slug
  excerpt TEXT, -- Short description
  content TEXT NOT NULL, -- Full blog post content (markdown/HTML)
  featured_image_url TEXT,
  category TEXT NOT NULL, -- e.g., 'planning', 'tips', 'venues', 'real-weddings'
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'id')),
  author_id UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  tags TEXT[], -- Array of tags
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public can read active prompts" ON ai_prompts;
DROP POLICY IF EXISTS "Admins can manage prompts" ON ai_prompts;
DROP POLICY IF EXISTS "Public can read active tips" ON wedding_tips;
DROP POLICY IF EXISTS "Admins can manage tips" ON wedding_tips;
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

-- AI Prompts Policies
-- Public can read active prompts (for use in app)
CREATE POLICY "Public can read active prompts"
  ON ai_prompts FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage prompts"
  ON ai_prompts FOR ALL
  USING (public.is_admin_user());

-- Wedding Tips Policies
-- Public can read active tips
CREATE POLICY "Public can read active tips"
  ON wedding_tips FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage tips"
  ON wedding_tips FOR ALL
  USING (public.is_admin_user());

-- Blog Posts Policies
-- Public can read published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  USING (public.is_admin_user());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS update_ai_prompts_updated_at ON ai_prompts;
DROP TRIGGER IF EXISTS update_wedding_tips_updated_at ON wedding_tips;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

-- Triggers for updated_at
CREATE TRIGGER update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_tips_updated_at
  BEFORE UPDATE ON wedding_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Sample AI Prompt
INSERT INTO ai_prompts (name, category, prompt_text, is_active)
VALUES (
  'default_chat',
  'chat',
  'You are a helpful Bali Wedding AI Assistant. Help users plan their perfect wedding in Bali by providing venue recommendations, budget advice, vendor connections, and timeline planning. Be friendly, professional, and knowledgeable about Balinese wedding traditions.',
  true
) ON CONFLICT (name) DO NOTHING;

-- Sample Wedding Tip
INSERT INTO wedding_tips (title, content, category, language, is_active)
VALUES (
  'Budget Planning Tips',
  'Plan your Bali wedding budget wisely! Consider: venue (40%), catering (25%), photography (15%), decorations (10%), and miscellaneous (10%). Always set aside 10-15% for unexpected costs.',
  'budget',
  'en',
  true
) ON CONFLICT DO NOTHING;

