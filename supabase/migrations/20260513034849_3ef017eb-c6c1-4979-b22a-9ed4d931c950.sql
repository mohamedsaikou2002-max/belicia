CREATE TABLE public.eagle_eye_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  subject TEXT NOT NULL,
  seed_username TEXT,
  accounts JSONB NOT NULL DEFAULT '[]'::jsonb,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  exif JSONB NOT NULL DEFAULT '[]'::jsonb,
  contacts JSONB NOT NULL DEFAULT '{}'::jsonb,
  graph JSONB NOT NULL DEFAULT '{}'::jsonb,
  report TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.eagle_eye_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open read eagle" ON public.eagle_eye_targets FOR SELECT USING (true);
CREATE POLICY "open insert eagle" ON public.eagle_eye_targets FOR INSERT WITH CHECK (true);
CREATE POLICY "open update eagle" ON public.eagle_eye_targets FOR UPDATE USING (true);
CREATE POLICY "open delete eagle" ON public.eagle_eye_targets FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.touch_eagle_eye()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER eagle_eye_touch BEFORE UPDATE ON public.eagle_eye_targets
FOR EACH ROW EXECUTE FUNCTION public.touch_eagle_eye();