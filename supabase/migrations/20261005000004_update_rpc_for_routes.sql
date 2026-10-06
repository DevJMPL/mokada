-- Drop the assignments table
DROP TABLE IF EXISTS public.agent_route_assignments;

-- Update the get_or_create_current_trip RPC
CREATE OR REPLACE FUNCTION public.get_or_create_current_trip(p_agent_id uuid, p_local_date date)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_id uuid;
  v_week_start date;
  v_week_end date;
  v_routes_count integer;
  v_weeks_since_epoch integer;
  v_route_index integer;
  v_selected_route record;
BEGIN
  -- Calculate week_start (Monday) and week_end (Sunday) for the given date
  v_week_start := date_trunc('week', p_local_date)::date;
  v_week_end := v_week_start + interval '6 days';

  -- Check if a trip already exists for this week
  SELECT id INTO v_trip_id
  FROM public.route_trips
  WHERE agent_id = p_agent_id
    AND week_start_date <= p_local_date
    AND week_end_date >= p_local_date
    AND status IN ('PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'UNDER_REVIEW', 'SETTLED')
  ORDER BY week_start_date DESC
  LIMIT 1;

  IF v_trip_id IS NOT NULL THEN
    RETURN v_trip_id;
  END IF;

  -- Count active routes assigned to this agent
  SELECT count(*) INTO v_routes_count
  FROM public.routes
  WHERE agent_id = p_agent_id AND is_active = true;

  IF v_routes_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Epoch is 2024-01-01 (which is a Monday)
  v_weeks_since_epoch := (v_week_start - '2024-01-01'::date) / 7;
  
  -- Calculate the alternating index
  v_route_index := v_weeks_since_epoch % v_routes_count;

  -- Select the route based on sequence_order
  SELECT * INTO v_selected_route
  FROM public.routes
  WHERE agent_id = p_agent_id AND is_active = true
  ORDER BY sequence_order ASC, name ASC
  OFFSET v_route_index
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Create the new trip
  INSERT INTO public.route_trips (
    route_id,
    agent_id,
    vehicle_id,
    week_start_date,
    week_end_date,
    budget_amount,
    status
  ) VALUES (
    v_selected_route.id,
    p_agent_id,
    v_selected_route.default_vehicle_id,
    v_week_start,
    v_week_end,
    v_selected_route.default_weekly_budget,
    'ASSIGNED'
  ) RETURNING id INTO v_trip_id;

  RETURN v_trip_id;
END;
$$;
