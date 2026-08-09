CREATE TYPE public.settlement_status_type AS ENUM ('PENDING', 'APPROVED', 'SETTLED', 'CANCELLED');
CREATE TYPE public.settlement_type_enum AS ENUM ('BALANCED', 'AGENT_RETURNS_CASH', 'COMPANY_REIMBURSES');

CREATE TABLE public.route_trip_settlements (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  route_trip_id uuid NOT NULL REFERENCES public.route_trips(id) ON DELETE CASCADE UNIQUE,
  budget_amount numeric NOT NULL,
  approved_expenses numeric NOT NULL,
  balance numeric NOT NULL,
  settlement_type public.settlement_type_enum NOT NULL,
  settlement_amount numeric NOT NULL,
  status public.settlement_status_type DEFAULT 'PENDING' NOT NULL,
  reviewed_by uuid REFERENCES public.user_profiles(id),
  settled_by uuid REFERENCES public.user_profiles(id),
  reviewed_at timestamp with time zone,
  settled_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TYPE public.settlement_transaction_type AS ENUM ('CASH_RETURN', 'REIMBURSEMENT');

CREATE TABLE public.settlement_transactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  settlement_id uuid NOT NULL REFERENCES public.route_trip_settlements(id) ON DELETE CASCADE,
  transaction_type public.settlement_transaction_type NOT NULL,
  amount numeric NOT NULL,
  transaction_date date NOT NULL,
  reference text,
  attachment_path text,
  created_by uuid REFERENCES public.user_profiles(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE OR REPLACE VIEW public.route_trip_financial_summary AS
SELECT 
  rt.id AS route_trip_id,
  r.code AS route_code,
  r.name AS route_name,
  rt.agent_id,
  rt.vehicle_id,
  rt.week_start_date,
  rt.week_end_date,
  rt.budget_amount,
  rt.status AS route_trip_status,
  COALESCE(SUM(te.amount), 0) AS total_expenses,
  COALESCE(SUM(te.amount) FILTER (WHERE te.status = 'APPROVED'), 0) AS approved_expenses,
  COALESCE(SUM(te.amount) FILTER (WHERE te.status = 'DRAFT' OR te.status = 'SUBMITTED' OR te.status = 'REQUIRES_INFORMATION'), 0) AS pending_expenses,
  COALESCE(SUM(te.amount) FILTER (WHERE te.status = 'REJECTED'), 0) AS rejected_expenses,
  rt.budget_amount - COALESCE(SUM(te.amount) FILTER (WHERE te.status = 'APPROVED'), 0) AS balance,
  CASE 
    WHEN (rt.budget_amount - COALESCE(SUM(te.amount) FILTER (WHERE te.status = 'APPROVED'), 0)) = 0 THEN 'BALANCED'::public.settlement_type_enum
    WHEN (rt.budget_amount - COALESCE(SUM(te.amount) FILTER (WHERE te.status = 'APPROVED'), 0)) > 0 THEN 'AGENT_RETURNS_CASH'::public.settlement_type_enum
    ELSE 'COMPANY_REIMBURSES'::public.settlement_type_enum
  END AS settlement_type
FROM public.route_trips rt
JOIN public.routes r ON r.id = rt.route_id
LEFT JOIN public.travel_expenses te ON te.route_trip_id = rt.id
GROUP BY rt.id, r.code, r.name;

GRANT ALL ON public.route_trip_financial_summary TO anon;
GRANT ALL ON public.route_trip_financial_summary TO authenticated;
GRANT ALL ON public.route_trip_financial_summary TO service_role;

ALTER TABLE public.route_trip_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.route_trip_settlements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.route_trip_settlements FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );

CREATE POLICY "Enable read access for all authenticated users" ON public.settlement_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.settlement_transactions FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
