create table public.gym_weekly_metrics (
  week_start date primary key,
  body_fat_pct numeric(5,2) not null check (body_fat_pct > 0 and body_fat_pct < 100),
  muscle_pct numeric(5,2) not null check (muscle_pct > 0 and muscle_pct < 100),
  updated_at timestamptz not null default now(),
  constraint gym_weekly_metrics_monday check (extract(isodow from week_start) = 1),
  constraint gym_weekly_metrics_year check (week_start >= date '2026-10-05' and week_start <= date '2027-10-04')
);

alter table public.gym_weekly_metrics enable row level security;
create policy "Shared gym weekly metrics" on public.gym_weekly_metrics
  for all to anon, authenticated using (true) with check (true);
grant select, insert, update on public.gym_weekly_metrics to anon, authenticated;
