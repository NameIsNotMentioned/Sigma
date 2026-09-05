create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  destination text,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  name text not null,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  paid_by uuid references public.participants(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  split_type text not null default 'equal' check (split_type in ('equal', 'per_participant', 'shared_room', 'organizer_paid')),
  created_at timestamptz default now()
);

alter table public.trips enable row level security;
alter table public.participants enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "Owners manage their trips" on public.trips;
drop policy if exists "Owners manage participants of their trips" on public.participants;
drop policy if exists "Owners manage expenses of their trips" on public.expenses;

create policy "Owners manage their trips" on public.trips for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners manage participants of their trips" on public.participants for all using (exists (select 1 from public.trips where trips.id = participants.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = participants.trip_id and trips.owner_id = auth.uid()));
create policy "Owners manage expenses of their trips" on public.expenses for all using (exists (select 1 from public.trips where trips.id = expenses.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = expenses.trip_id and trips.owner_id = auth.uid()));
