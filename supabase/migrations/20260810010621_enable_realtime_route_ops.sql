-- Enable realtime for route trips and expenses
BEGIN;

ALTER PUBLICATION supabase_realtime ADD TABLE route_trips;
ALTER PUBLICATION supabase_realtime ADD TABLE travel_expenses;

COMMIT;
