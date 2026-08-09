ALTER TABLE public.routes ADD COLUMN working_days text[] DEFAULT '{L,M,X,J,V}'::text[];
