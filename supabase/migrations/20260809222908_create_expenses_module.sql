CREATE TABLE public.expense_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  requires_receipt boolean DEFAULT false NOT NULL,
  requires_invoice boolean DEFAULT false NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TYPE public.travel_expense_status_type AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REQUIRES_INFORMATION');

CREATE TABLE public.travel_expenses (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  route_trip_id uuid NOT NULL REFERENCES public.route_trips(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.user_profiles(id),
  expense_category_id uuid NOT NULL REFERENCES public.expense_categories(id),
  amount numeric NOT NULL,
  expense_date date NOT NULL,
  description text,
  merchant_name text,
  place_name text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  payment_method text,
  invoice_available boolean DEFAULT false NOT NULL,
  status public.travel_expense_status_type DEFAULT 'DRAFT' NOT NULL,
  notes text,
  created_by uuid REFERENCES public.user_profiles(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT travel_expenses_amount_check CHECK (amount > 0)
);

CREATE TYPE public.expense_attachment_type AS ENUM ('RECEIPT', 'INVOICE', 'PHOTO', 'OTHER');

CREATE TABLE public.expense_attachments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  expense_id uuid NOT NULL REFERENCES public.travel_expenses(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size integer,
  attachment_type public.expense_attachment_type DEFAULT 'RECEIPT' NOT NULL,
  uploaded_by uuid REFERENCES public.user_profiles(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.expense_categories FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );

CREATE POLICY "Agents can read their own expenses" ON public.travel_expenses FOR SELECT TO authenticated USING ( agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Agents can manage their own expenses" ON public.travel_expenses FOR ALL TO authenticated USING ( agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );

CREATE POLICY "Agents can read their own attachments" ON public.expense_attachments FOR SELECT TO authenticated USING ( uploaded_by IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Agents can manage their own attachments" ON public.expense_attachments FOR ALL TO authenticated USING ( uploaded_by IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
