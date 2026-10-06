CREATE OR REPLACE FUNCTION public.get_or_create_current_trip(p_agent_id uuid, p_local_date date)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_id uuid;
  v_week_start date;
  v_week_end date;
  v_last_sequence_order integer;
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

  -- Find the sequence_order of the last route this agent was assigned to
  -- (excluding the current week since we just checked it doesn't exist)
  SELECT r.sequence_order INTO v_last_sequence_order
  FROM public.route_trips rt
  JOIN public.routes r ON r.id = rt.route_id
  WHERE rt.agent_id = p_agent_id
    AND rt.week_start_date < v_week_start
  ORDER BY rt.week_start_date DESC
  LIMIT 1;

  -- If they had a previous trip, find the NEXT route in the sequence
  IF v_last_sequence_order IS NOT NULL THEN
    SELECT * INTO v_selected_route
    FROM public.routes
    WHERE agent_id = p_agent_id 
      AND is_active = true 
      AND sequence_order > v_last_sequence_order
    ORDER BY sequence_order ASC, name ASC
    LIMIT 1;
  END IF;

  -- If it's their very first trip ever, or if we wrapped around the end of the sequence
  IF v_selected_route IS NULL THEN
    SELECT * INTO v_selected_route
    FROM public.routes
    WHERE agent_id = p_agent_id 
      AND is_active = true
    ORDER BY sequence_order ASC, name ASC
    LIMIT 1;
  END IF;

  -- If the agent has absolutely no active routes assigned, we can't create a trip
  IF v_selected_route IS NULL THEN
    RETURN NULL;
  END IF;

  -- Create the new trip with the next route in the sequence
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
