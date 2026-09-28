-- supabase/migrations/20260928000000_assign_agent_routes_and_rls.sql

-- 1. Add agent_id to routes
ALTER TABLE public.routes
  ADD COLUMN agent_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_routes_agent_id ON public.routes(agent_id);

-- 2. Update Policies for customers
DROP POLICY IF EXISTS customers_select_staff_or_self ON public.customers;
CREATE POLICY customers_select_staff_or_self ON public.customers FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            created_by = auth.uid() OR
            id IN (
                SELECT cb.customer_id FROM public.customer_branches cb 
                JOIN public.routes r ON r.id = cb.route_id 
                WHERE r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
            )
        )
    )
    OR auth_user_id = auth.uid()
);

DROP POLICY IF EXISTS customers_update_staff ON public.customers;
CREATE POLICY customers_update_staff ON public.customers FOR UPDATE TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            created_by = auth.uid() OR
            id IN (
                SELECT cb.customer_id FROM public.customer_branches cb 
                JOIN public.routes r ON r.id = cb.route_id 
                WHERE r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
            )
        )
    )
) WITH CHECK (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            created_by = auth.uid() OR
            id IN (
                SELECT cb.customer_id FROM public.customer_branches cb 
                JOIN public.routes r ON r.id = cb.route_id 
                WHERE r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
            )
        )
    )
);

-- 3. Update Policies for customer_branches
DROP POLICY IF EXISTS customer_branches_select_staff_or_self ON public.customer_branches;
CREATE POLICY customer_branches_select_staff_or_self ON public.customer_branches FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            route_id IN (SELECT id FROM public.routes WHERE agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()))
            OR customer_id IN (SELECT id FROM public.customers WHERE created_by = auth.uid())
        )
    )
    OR customer_id = public.current_user_customer_id()
);

DROP POLICY IF EXISTS customer_branches_update_staff ON public.customer_branches;
CREATE POLICY customer_branches_update_staff ON public.customer_branches FOR UPDATE TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            route_id IN (SELECT id FROM public.routes WHERE agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()))
            OR customer_id IN (SELECT id FROM public.customers WHERE created_by = auth.uid())
        )
    )
) WITH CHECK (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            route_id IN (SELECT id FROM public.routes WHERE agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()))
            OR customer_id IN (SELECT id FROM public.customers WHERE created_by = auth.uid())
        )
    )
);

-- 4. Update Policies for customer_fiscal_profiles
DROP POLICY IF EXISTS customer_fiscal_profiles_select_staff_or_self ON public.customer_fiscal_profiles;
CREATE POLICY customer_fiscal_profiles_select_staff_or_self ON public.customer_fiscal_profiles FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            customer_id IN (
                SELECT cb.customer_id FROM public.customer_branches cb 
                JOIN public.routes r ON r.id = cb.route_id 
                WHERE r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
            )
            OR customer_id IN (SELECT id FROM public.customers WHERE created_by = auth.uid())
        )
    )
    OR customer_id = public.current_user_customer_id()
);

DROP POLICY IF EXISTS customer_fiscal_profiles_update_staff ON public.customer_fiscal_profiles;
CREATE POLICY customer_fiscal_profiles_update_staff ON public.customer_fiscal_profiles FOR UPDATE TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            customer_id IN (
                SELECT cb.customer_id FROM public.customer_branches cb 
                JOIN public.routes r ON r.id = cb.route_id 
                WHERE r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
            )
            OR customer_id IN (SELECT id FROM public.customers WHERE created_by = auth.uid())
        )
    )
) WITH CHECK (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR (
        public.current_user_can_manage_customers() AND (
            customer_id IN (
                SELECT cb.customer_id FROM public.customer_branches cb 
                JOIN public.routes r ON r.id = cb.route_id 
                WHERE r.agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
            )
            OR customer_id IN (SELECT id FROM public.customers WHERE created_by = auth.uid())
        )
    )
);


-- 5. Update Policies for routes
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.routes;
CREATE POLICY "Enable read access for admin or assigned agent" ON public.routes FOR SELECT TO authenticated USING (
    (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN'
    OR agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);
