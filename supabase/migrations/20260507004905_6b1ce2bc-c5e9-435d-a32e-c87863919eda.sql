-- PEMF biofield readings
CREATE TABLE IF NOT EXISTS public.pemf_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  hrv_score FLOAT,
  coherence_score FLOAT,
  stress_index FLOAT,
  recovery_state TEXT,
  dominant_frequency FLOAT,
  ambient_field_delta FLOAT,
  session_type TEXT,
  notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pemf_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pemf" ON public.pemf_readings FOR SELECT USING (true);
CREATE POLICY "public insert pemf" ON public.pemf_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete pemf" ON public.pemf_readings FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_pemf_user_time ON public.pemf_readings(user_id, timestamp DESC);

-- Scheduled / delivered briefs
CREATE TABLE IF NOT EXISTS public.scheduled_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  brief_type TEXT,
  scheduled_for TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  content TEXT,
  delivery_channel TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scheduled_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read briefs" ON public.scheduled_briefs FOR SELECT USING (true);
CREATE POLICY "public insert briefs" ON public.scheduled_briefs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update briefs" ON public.scheduled_briefs FOR UPDATE USING (true);
CREATE POLICY "public delete briefs" ON public.scheduled_briefs FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_briefs_user_time ON public.scheduled_briefs(user_id, created_at DESC);

-- Home Assistant command log
CREATE TABLE IF NOT EXISTS public.home_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  command JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT
);
ALTER TABLE public.home_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read home" ON public.home_commands FOR SELECT USING (true);
CREATE POLICY "public insert home" ON public.home_commands FOR INSERT WITH CHECK (true);

-- Extend belicia_profile
ALTER TABLE public.belicia_profile
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS preferred_inquiry_mode TEXT DEFAULT 'wisdom',
  ADD COLUMN IF NOT EXISTS voice_profile TEXT DEFAULT 'belicia_default',
  ADD COLUMN IF NOT EXISTS response_depth TEXT DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS language_register TEXT DEFAULT 'scholarly',
  ADD COLUMN IF NOT EXISTS active_missions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS key_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS strategic_context TEXT,
  ADD COLUMN IF NOT EXISTS pemf_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS baseline_hrv FLOAT,
  ADD COLUMN IF NOT EXISTS peak_focus_windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pemf_sleep_protocol TEXT DEFAULT 'delta_standard',
  ADD COLUMN IF NOT EXISTS pemf_morning_protocol TEXT DEFAULT 'energize_10hz',
  ADD COLUMN IF NOT EXISTS madhab TEXT,
  ADD COLUMN IF NOT EXISTS prayer_location JSONB,
  ADD COLUMN IF NOT EXISTS dhikr_preferences JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS spiritual_station TEXT,
  ADD COLUMN IF NOT EXISTS avg_session_length_mins FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_suggestion_density TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS current_pemf_state JSONB,
  ADD COLUMN IF NOT EXISTS push_subscription JSONB,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Extend belicia_memory
ALTER TABLE public.belicia_memory
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS inquiry_mode TEXT,
  ADD COLUMN IF NOT EXISTS memory_type TEXT DEFAULT 'exchange',
  ADD COLUMN IF NOT EXISTS pemf_coherence_at_time FLOAT;

-- Allow updating belicia_memory (was missing)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='belicia_memory' AND policyname='public update memory') THEN
    EXECUTE 'CREATE POLICY "public update memory" ON public.belicia_memory FOR UPDATE USING (true)';
  END IF;
END $$;

-- Seed default profile row if missing
INSERT INTO public.belicia_profile (user_id)
SELECT 'default'
WHERE NOT EXISTS (SELECT 1 FROM public.belicia_profile WHERE user_id='default');