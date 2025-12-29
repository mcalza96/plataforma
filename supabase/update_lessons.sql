ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS download_url TEXT;

