alter table public.gym_checkins drop constraint gym_checkins_status_check;
alter table public.gym_checkins add constraint gym_checkins_status_check
  check (status = any (array['full','relax','missed','cardio','muscle','pilates','other']::text[]));
