-- Scope private chat history and profiles to the signed-in Supabase account.
-- Apply this migration before deploying the authenticated chat/memory Edge Functions.
ALTER TABLE public.belicia_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.belicia_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "public insert memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "public update memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "public delete memory" ON public.belicia_memory;

DROP POLICY IF EXISTS "users read own memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "users insert own memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "users update own memory" ON public.belicia_memory;
DROP POLICY IF EXISTS "users delete own memory" ON public.belicia_memory;

CREATE POLICY "users read own memory" ON public.belicia_memory
  FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "users insert own memory" ON public.belicia_memory
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "users update own memory" ON public.belicia_memory
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "users delete own memory" ON public.belicia_memory
  FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "public read profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "public insert profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "public update profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "users read own profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "users insert own profile" ON public.belicia_profile;
DROP POLICY IF EXISTS "users update own profile" ON public.belicia_profile;

CREATE POLICY "users read own profile" ON public.belicia_profile
  FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "users insert own profile" ON public.belicia_profile
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "users update own profile" ON public.belicia_profile
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

-- Existing legacy rows under user_id='default' remain unassigned and inaccessible
-- to normal signed-in users; do not automatically attach them to a new account.
