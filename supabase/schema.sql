-- Cirque Social Media Dashboard Schema
-- Run this in the Supabase SQL Editor

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insights
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, date)
);

-- 3. Drafts
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL DEFAULT 'Untitled Draft',
  caption TEXT DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'reel', 'story', 'carousel', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'posted')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok')),
  content_type TEXT CHECK (content_type IN ('post', 'reel', 'story', 'carousel', 'tiktok')),
  draft_id UUID REFERENCES drafts(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#6366f1',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Generations
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  generation_type TEXT NOT NULL CHECK (generation_type IN ('caption', 'hashtags', 'ideas', 'post_plan', 'suggestions')),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Brand Settings
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  UNIQUE(user_id, key)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own insights" ON insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON insights FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own drafts" ON drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drafts" ON drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drafts" ON drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drafts" ON drafts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar events" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ai generations" ON ai_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai generations" ON ai_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own brand settings" ON brand_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand settings" ON brand_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand settings" ON brand_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand settings" ON brand_settings FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  -- Seed default brand settings
  INSERT INTO brand_settings (user_id, key, value) VALUES
    (NEW.id, 'name', 'Cirque'),
    (NEW.id, 'voice', 'Bold, adventurous, premium. We speak to those who push boundaries on the mountain.'),
    (NEW.id, 'audience', 'Skiers and snowboarders aged 18-35 who value performance gear and mountain culture.'),
    (NEW.id, 'content_pillars', 'Mountain adventures, product innovation, athlete stories, behind-the-scenes, user-generated content'),
    (NEW.id, 'hashtags', '#cirqueoutside #cirquegoggles #sendit #mountainlife #skilife #snowboarding #powderday');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
