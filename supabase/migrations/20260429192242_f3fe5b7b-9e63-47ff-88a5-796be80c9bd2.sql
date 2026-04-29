
CREATE TABLE public.belicia_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  importance INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX belicia_memory_user_created_idx ON public.belicia_memory (user_id, created_at DESC);
CREATE INDEX belicia_memory_importance_idx ON public.belicia_memory (user_id, importance DESC);

CREATE TABLE public.belicia_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE DEFAULT 'default',
  name TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  thought_patterns JSONB NOT NULL DEFAULT '{}'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.belicia_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.belicia_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read memory" ON public.belicia_memory FOR SELECT USING (true);
CREATE POLICY "public insert memory" ON public.belicia_memory FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete memory" ON public.belicia_memory FOR DELETE USING (true);

CREATE POLICY "public read profile" ON public.belicia_profile FOR SELECT USING (true);
CREATE POLICY "public insert profile" ON public.belicia_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "public update profile" ON public.belicia_profile FOR UPDATE USING (true);
