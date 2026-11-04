-- Belicia account isolation for the *Supabase* migration runner.
-- Existing drizzle/migrations/0000_mkii_auth_security.sql was not in the
-- Supabase migrations path. This migration is safe to rerun and preserves
-- existing data, including legacy rows owned by 'default' (not exposed to users).
BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  inquiry_mode text NOT NULL DEFAULT 'wisdom',
  response_depth text NOT NULL DEFAULT 'balanced',
  strategic_context text,
  timezone text NOT NULL DEFAULT 'UTC',
  spiritual_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.belicia_create_user_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.belicia_profile (user_id, display_name)
  VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_belicia_auth_user_created ON auth.users;
CREATE TRIGGER on_belicia_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.belicia_create_user_profile();

-- Backfill missing metadata only; never reassign pre-auth 'default' rows.
INSERT INTO public.profiles (id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data ->> 'display_name', split_part(COALESCE(u.email, ''), '@', 1))
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.belicia_profile (user_id, display_name)
SELECT u.id::text, COALESCE(u.raw_user_meta_data ->> 'display_name', split_part(COALESCE(u.email, ''), '@', 1))
FROM auth.users AS u
ON CONFLICT (user_id) DO NOTHING;

-- All customer records are private to their verified Supabase Auth UID.
-- A service-role client must still scope its queries explicitly to verified UID.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'belicia_profile', 'belicia_memory', 'eagle_eye_targets',
    'home_commands', 'mirofish_sims', 'pemf_readings', 'scheduled_briefs'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);
  END LOOP;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.belicia_profile TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belicia_memory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eagle_eye_targets TO authenticated;
GRANT SELECT, INSERT ON public.home_commands TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mirofish_sims TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.pemf_readings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_briefs TO authenticated;

DROP POLICY IF EXISTS "profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "profiles update own" ON public.profiles;
CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "public read profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "public insert profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "public update profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "bprofile select own" ON public.belicia_profile;
DROP POLICY IF EXISTS "bprofile insert own" ON public.belicia_profile;
DROP POLICY IF EXISTS "bprofile update own" ON public.belicia_profile;
CREATE POLICY "bprofile select own" ON public.belicia_profile FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "bprofile insert own" ON public.belicia_profile FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "bprofile update own" ON public.belicia_profile FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())::text) WITH CHECK (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "public read memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "public insert memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "public update memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "public delete memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "memory select own" ON public.belicia_memory;
DROP POLICY IF EXISTS "memory insert own" ON public.belicia_memory;
DROP POLICY IF EXISTS "memory update own" ON public.belicia_memory;
DROP POLICY IF EXISTS "memory delete own" ON public.belicia_memory;
CREATE POLICY "memory select own" ON public.belicia_memory FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "memory insert own" ON public.belicia_memory FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "memory update own" ON public.belicia_memory FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())::text) WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "memory delete own" ON public.belicia_memory FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "open read eagle" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "open insert eagle" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "open update eagle" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "open delete eagle" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "eagle select own" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "eagle insert own" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "eagle update own" ON public.eagle_eye_targets;
DROP POLICY IF EXISTS "eagle delete own" ON public.eagle_eye_targets;
CREATE POLICY "eagle select own" ON public.eagle_eye_targets FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "eagle insert own" ON public.eagle_eye_targets FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "eagle update own" ON public.eagle_eye_targets FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())::text) WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "eagle delete own" ON public.eagle_eye_targets FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "public read home" ON public.home_commands;
DROP POLICY IF EXISTS "public insert home" ON public.home_commands;
DROP POLICY IF EXISTS "home select own" ON public.home_commands;
DROP POLICY IF EXISTS "home insert own" ON public.home_commands;
CREATE POLICY "home select own" ON public.home_commands FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "home insert own" ON public.home_commands FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "open read mirofish" ON public.mirofish_sims;
DROP POLICY IF EXISTS "open write mirofish" ON public.mirofish_sims;
DROP POLICY IF EXISTS "open update mirofish" ON public.mirofish_sims;
DROP POLICY IF EXISTS "open delete mirofish" ON public.mirofish_sims;
DROP POLICY IF EXISTS "sims select own" ON public.mirofish_sims;
DROP POLICY IF EXISTS "sims insert own" ON public.mirofish_sims;
DROP POLICY IF EXISTS "sims update own" ON public.mirofish_sims;
DROP POLICY IF EXISTS "sims delete own" ON public.mirofish_sims;
CREATE POLICY "sims select own" ON public.mirofish_sims FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "sims insert own" ON public.mirofish_sims FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "sims update own" ON public.mirofish_sims FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())::text) WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "sims delete own" ON public.mirofish_sims FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "public read pemf" ON public.pemf_readings;
DROP POLICY IF EXISTS "public insert pemf" ON public.pemf_readings;
DROP POLICY IF EXISTS "public delete pemf" ON public.pemf_readings;
DROP POLICY IF EXISTS "pemf select own" ON public.pemf_readings;
DROP POLICY IF EXISTS "pemf insert own" ON public.pemf_readings;
DROP POLICY IF EXISTS "pemf delete own" ON public.pemf_readings;
CREATE POLICY "pemf select own" ON public.pemf_readings FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "pemf insert own" ON public.pemf_readings FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "pemf delete own" ON public.pemf_readings FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "public read briefs" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "public insert briefs" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "public update briefs" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "public delete briefs" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "briefs select own" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "briefs insert own" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "briefs update own" ON public.scheduled_briefs;
DROP POLICY IF EXISTS "briefs delete own" ON public.scheduled_briefs;
CREATE POLICY "briefs select own" ON public.scheduled_briefs FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid())::text);
CREATE POLICY "briefs insert own" ON public.scheduled_briefs FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "briefs update own" ON public.scheduled_briefs FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())::text) WITH CHECK (user_id = (SELECT auth.uid())::text);
CREATE POLICY "briefs delete own" ON public.scheduled_briefs FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid())::text);

CREATE INDEX IF NOT EXISTS idx_memory_user_session ON public.belicia_memory (user_id, session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefs_user ON public.scheduled_briefs (user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_pemf_user ON public.pemf_readings (user_id, timestamp DESC);

COMMIT;
