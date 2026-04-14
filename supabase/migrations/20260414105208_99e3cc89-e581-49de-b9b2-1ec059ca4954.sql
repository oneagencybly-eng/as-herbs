
-- Telecallers table
CREATE TABLE public.telecallers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pin TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_telecallers_phone ON public.telecallers (phone);

ALTER TABLE public.telecallers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read telecallers"
ON public.telecallers FOR SELECT USING (true);

CREATE POLICY "Anyone can insert telecallers"
ON public.telecallers FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update telecallers"
ON public.telecallers FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete telecallers"
ON public.telecallers FOR DELETE USING (true);

-- Order assignments table
CREATE TABLE public.order_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  telecaller_id UUID NOT NULL REFERENCES public.telecallers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(order_id, telecaller_id)
);

ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assignments"
ON public.order_assignments FOR SELECT USING (true);

CREATE POLICY "Anyone can insert assignments"
ON public.order_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update assignments"
ON public.order_assignments FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete assignments"
ON public.order_assignments FOR DELETE USING (true);
