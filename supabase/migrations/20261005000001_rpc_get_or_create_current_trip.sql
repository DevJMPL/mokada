CREATE OR REPLACE FUNCTION public.get_or_create_current_trip(p_agent_id uuid, p_local_date date)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_id uuid;
  v_week_start date;
  v_week_end date;
  v_assignments_count integer;
  v_weeks_since_epoch integer;
  v_assignment_index integer;
  v_selected_assignment record;
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

  -- Count active assignments
  SELECT count(*) INTO v_assignments_count
  FROM public.agent_route_assignments
  WHERE agent_id = p_agent_id AND is_active = true;

  IF v_assignments_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Epoch is 2024-01-01 (which is a Monday)
  -- If you need a different epoch, just change this date.
  v_weeks_since_epoch := (v_week_start - '2024-01-01'::date) / 7;
  
  -- The % operator in postgres for integers handles positive values properly
  v_assignment_index := v_weeks_since_epoch % v_assignments_count;

  -- Select the assignment based on sequence_order
  SELECT * INTO v_selected_assignment
  FROM public.agent_route_assignments
  WHERE agent_id = p_agent_id AND is_active = true
  ORDER BY sequence_order ASC
  OFFSET v_assignment_index
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
    v_selected_assignment.route_id,
    p_agent_id,
    v_selected_assignment.default_vehicle_id,
    v_week_start,
    v_week_end,
    v_selected_assignment.default_budget_amount,
    'ASSIGNED'
  ) RETURNING id INTO v_trip_id;

  RETURN v_trip_id;
END;
$$;
