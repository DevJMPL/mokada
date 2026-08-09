-- Create expense-evidence bucket if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expense-evidence', 'expense-evidence', false) 
ON CONFLICT (id) DO NOTHING;

-- Policies for expense-evidence bucket
CREATE POLICY "Authenticated users can access expense-evidence"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'expense-evidence')
WITH CHECK (bucket_id = 'expense-evidence');

-- Seed expense categories
INSERT INTO public.expense_categories (code, name, requires_receipt, requires_invoice) VALUES
  ('FUEL', 'Gasolina', true, true),
  ('TOLL', 'Casetas', true, false),
  ('HOTEL', 'Hotel', true, true),
  ('FOOD', 'Alimentos', true, false),
  ('PARKING', 'Estacionamiento', true, false),
  ('MAINTENANCE', 'Mantenimiento', true, true),
  ('OTHER', 'Otros', false, false)
ON CONFLICT (code) DO NOTHING;
