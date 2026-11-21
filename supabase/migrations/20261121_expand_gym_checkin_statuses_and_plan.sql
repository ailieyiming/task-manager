alter table public.gym_checkins drop constraint gym_checkins_status_check;
alter table public.gym_checkins add constraint gym_checkins_status_check
  check (status = any (array['full','relax','missed','cardio','muscle','other']::text[]));

alter table public.gym_weekly_checklists drop constraint gym_weekly_checklists_items;
alter table public.gym_weekly_checklists add constraint gym_weekly_checklists_items
  check (completed_items <@ array['lower_a','lower_b','lower_c','upper_a','upper_b','pilates_a','pilates_b','walking']::text[]);
