create table public.gym_weekly_checklists (
  week_start date primary key,
  completed_items text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint gym_weekly_checklists_monday check (extract(isodow from week_start) = 1),
  constraint gym_weekly_checklists_year check (week_start >= date '2026-10-05' and week_start <= date '2027-10-04'),
  constraint gym_weekly_checklists_items check (completed_items <@ array['lower_a','upper_a','lower_b','upper_b','pilates_a','pilates_b','walking']::text[])
);

alter table public.gym_weekly_checklists enable row level security;
create policy "Shared gym weekly checklist" on public.gym_weekly_checklists
  for all to anon, authenticated using (true) with check (true);
grant select, insert, update on public.gym_weekly_checklists to anon, authenticated;
