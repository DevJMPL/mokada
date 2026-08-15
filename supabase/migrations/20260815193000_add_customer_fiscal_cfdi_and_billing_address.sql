ALTER TABLE public.customer_fiscal_profiles
  ADD COLUMN IF NOT EXISTS cfdi_use text NOT NULL DEFAULT 'G03',
  ADD COLUMN IF NOT EXISTS billing_street text,
  ADD COLUMN IF NOT EXISTS billing_exterior_number text,
  ADD COLUMN IF NOT EXISTS billing_interior_number text,
  ADD COLUMN IF NOT EXISTS billing_neighborhood text,
  ADD COLUMN IF NOT EXISTS billing_municipality text,
  ADD COLUMN IF NOT EXISTS billing_state text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_fiscal_profiles_cfdi_use_check'
  ) THEN
    ALTER TABLE public.customer_fiscal_profiles
      ADD CONSTRAINT customer_fiscal_profiles_cfdi_use_check CHECK (length(trim(cfdi_use)) > 0);
  END IF;

END;
$$;
