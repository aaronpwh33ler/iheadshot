-- =====================================================
-- AI HEADSHOT GENERATOR - DATABASE SCHEMA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to set up
-- all required tables and security policies.
--
-- Steps:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Paste this entire file
-- 5. Click "Run"
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount INTEGER NOT NULL, -- in cents
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
  headshot_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'training', 'generating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Training jobs table
CREATE TABLE IF NOT EXISTS public.training_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  astria_tune_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'training', 'completed', 'failed')),
  model_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Generated images table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  training_job_id UUID REFERENCES public.training_jobs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Upload tracking table
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_order ON public.training_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON public.training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generated_images_order ON public.generated_images(order_id);
CREATE INDEX IF NOT EXISTS idx_uploads_order ON public.uploads(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Orders: Users can view their own orders (by user_id or email)
CREATE POLICY "Users can view own orders by user_id" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow public access to orders by ID (for non-authenticated flows)
CREATE POLICY "Public can view orders by id" ON public.orders
  FOR SELECT USING (true);

-- Training jobs: Viewable by order owner
CREATE POLICY "Users can view training jobs for their orders" ON public.training_jobs
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR true -- Allow public access for non-auth flow
  );

-- Generated images: Viewable by order owner
CREATE POLICY "Users can view generated images for their orders" ON public.generated_images
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR true -- Allow public access for non-auth flow
  );

-- Uploads: Viewable by order owner
CREATE POLICY "Users can view uploads for their orders" ON public.uploads
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR true -- Allow public access for non-auth flow
  );

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'headshots',
  'headshots',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow public uploads to headshots bucket
CREATE POLICY "Anyone can upload to headshots bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'headshots');

CREATE POLICY "Anyone can view headshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'headshots');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders updated_at
DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment below to insert test data

/*
-- Test order
INSERT INTO public.orders (id, email, amount, tier, headshot_count, status)
VALUES (
  'test-order-001',
  'test@example.com',
  3900,
  'pro',
  80,
  'pending'
);
*/

-- =====================================================
-- DONE!
-- =====================================================
-- Your database is now ready for the AI Headshot Generator.
-- Next steps:
-- 1. Set up your environment variables
-- 2. Connect Stripe
-- 3. Configure Astria.ai
-- 4. Deploy to Vercel
-- =====================================================
