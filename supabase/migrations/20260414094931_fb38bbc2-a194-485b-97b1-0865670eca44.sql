
ALTER TABLE public.orders ADD COLUMN ip_address text;

CREATE UNIQUE INDEX idx_orders_unique_ip ON public.orders (ip_address) WHERE ip_address IS NOT NULL;
