create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  current_medication text not null,
  current_dosage text not null,
  application_frequency_days int not null default 7,
  preferred_application_day text not null,
  start_weight numeric(5,2) not null,
  target_weight numeric(5,2),
  treatment_start_date date not null,
  goal text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_date date not null,
  application_time time not null,
  medication text not null,
  dosage text not null,
  injection_site text not null,
  injection_side text not null,
  pain_level int not null,
  symptoms text[] not null default '{}',
  mood int not null,
  energy int not null,
  appetite int not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null,
  weight numeric(5,2) not null,
  waist numeric(5,2),
  abdomen numeric(5,2),
  hips numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.measurements enable row level security;

create policy "profiles own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "applications own" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "measurements own" on public.measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
