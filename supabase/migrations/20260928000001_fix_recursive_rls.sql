-- supabase/migrations/20260928000001_fix_recursive_rls.sql

-- 1. Create a SECURITY DEFINER function to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.check_agent_customer_access(customer_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customers c WHERE c.id = customer_id_param AND c.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.customer_branches cb 
    JOIN public.routes r ON r.id = cb.route_id 
    WHERE cb.customer_id = customer_id_param 
    AND r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  );
$$;

-- 2. Update Policies for customers
DROP POLICY IF EXISTS customers_select_staff_or_self ON public.customers;
CREATE POLICY customers_select_staff_or_self ON public.customers FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(id)
    )
    OR auth_user_id = auth.uid()
);

DROP POLICY IF EXISTS customers_update_staff ON public.customers;
CREATE POLICY customers_update_staff ON public.customers FOR UPDATE TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(id)
    )
) WITH CHECK (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(id)
    )
);

-- 3. Update Policies for customer_branches
DROP POLICY IF EXISTS customer_branches_select_staff_or_self ON public.customer_branches;
CREATE POLICY customer_branches_select_staff_or_self ON public.customer_branches FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(customer_id)
    )
    OR customer_id = public.current_user_customer_id()
);

DROP POLICY IF EXISTS customer_branches_update_staff ON public.customer_branches;
CREATE POLICY customer_branches_update_staff ON public.customer_branches FOR UPDATE TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(customer_id)
    )
) WITH CHECK (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(customer_id)
    )
);

-- 4. Update Policies for customer_fiscal_profiles
DROP POLICY IF EXISTS customer_fiscal_profiles_select_staff_or_self ON public.customer_fiscal_profiles;
CREATE POLICY customer_fiscal_profiles_select_staff_or_self ON public.customer_fiscal_profiles FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(customer_id)
    )
    OR customer_id = public.current_user_customer_id()
);

DROP POLICY IF EXISTS customer_fiscal_profiles_update_staff ON public.customer_fiscal_profiles;
CREATE POLICY customer_fiscal_profiles_update_staff ON public.customer_fiscal_profiles FOR UPDATE TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(customer_id)
    )
) WITH CHECK (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND public.check_agent_customer_access(customer_id)
    )
);
