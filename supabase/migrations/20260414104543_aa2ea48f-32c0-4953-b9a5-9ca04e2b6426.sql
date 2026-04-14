
CREATE TABLE public.site_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  page_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast counting of recent visitors
CREATE INDEX idx_site_visitors_last_seen ON public.site_visitors (last_seen DESC);

-- Enable RLS
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for admin dashboard count)
CREATE POLICY "Anyone can read visitor count"
ON public.site_visitors
FOR SELECT
USING (true);

-- Anyone can insert their own session
CREATE POLICY "Anyone can register as visitor"
ON public.site_visitors
FOR INSERT
WITH CHECK (true);

-- Anyone can update their own heartbeat
CREATE POLICY "Anyone can update their heartbeat"
ON public.site_visitors
FOR UPDATE
USING (true);

-- Allow deleting stale sessions
CREATE POLICY "Anyone can delete stale sessions"
ON public.site_visitors
FOR DELETE
USING (true);
