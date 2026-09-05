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

alter table public.participants add column if not exists avatar text;
alter table public.expenses add column if not exists split_method text not null default 'equal';
alter table public.expenses add column if not exists custom_shares jsonb;
alter table public.expenses add column if not exists status text not null default 'active';
alter table public.expenses add column if not exists category text not null default 'other';
alter table public.expenses add column if not exists date date;
alter table public.expenses add column if not exists vendor text;
alter table public.expenses add column if not exists notes text;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  category text not null default 'other' check (category in ('transport','stay','activity','food','other')),
  vendor text,
  date date,
  time text,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  paid_by uuid references public.participants(id) on delete set null,
  status text not null default 'confirmed' check (status in ('confirmed','pending','cancelled')),
  location text,
  notes text,
  created_at timestamptz default now()
);

alter table public.expenses add column if not exists booking_id uuid references public.bookings(id) on delete set null;

create table if not exists public.booking_participants (
  booking_id uuid references public.bookings(id) on delete cascade not null,
  participant_id uuid references public.participants(id) on delete cascade not null,
  primary key (booking_id, participant_id)
);

create table if not exists public.expense_participants (
  expense_id uuid references public.expenses(id) on delete cascade not null,
  participant_id uuid references public.participants(id) on delete cascade not null,
  primary key (expense_id, participant_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  from_participant uuid references public.participants(id) not null,
  to_participant uuid references public.participants(id) not null,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  created_at timestamptz default now()
);

alter table public.trips enable row level security;
alter table public.participants enable row level security;
alter table public.expenses enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_participants enable row level security;
alter table public.expense_participants enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Owners manage their trips" on public.trips;
drop policy if exists "Owners manage participants of their trips" on public.participants;
drop policy if exists "Owners manage expenses of their trips" on public.expenses;
drop policy if exists "Owners manage bookings of their trips" on public.bookings;
drop policy if exists "Owners manage booking participants" on public.booking_participants;
drop policy if exists "Owners manage expense participants" on public.expense_participants;
drop policy if exists "Owners manage payments of their trips" on public.payments;

create policy "Owners manage their trips" on public.trips for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners manage participants of their trips" on public.participants for all using (exists (select 1 from public.trips where trips.id = participants.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = participants.trip_id and trips.owner_id = auth.uid()));
create policy "Owners manage expenses of their trips" on public.expenses for all using (exists (select 1 from public.trips where trips.id = expenses.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = expenses.trip_id and trips.owner_id = auth.uid()));
create policy "Owners manage bookings of their trips" on public.bookings for all using (exists (select 1 from public.trips where trips.id = bookings.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = bookings.trip_id and trips.owner_id = auth.uid()));
create policy "Owners manage booking participants" on public.booking_participants for all using (exists (select 1 from public.bookings join public.trips on trips.id = bookings.trip_id where bookings.id = booking_participants.booking_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.bookings join public.trips on trips.id = bookings.trip_id where bookings.id = booking_participants.booking_id and trips.owner_id = auth.uid()));
create policy "Owners manage expense participants" on public.expense_participants for all using (exists (select 1 from public.expenses join public.trips on trips.id = expenses.trip_id where expenses.id = expense_participants.expense_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.expenses join public.trips on trips.id = expenses.trip_id where expenses.id = expense_participants.expense_id and trips.owner_id = auth.uid()));
create policy "Owners manage payments of their trips" on public.payments for all using (exists (select 1 from public.trips where trips.id = payments.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = payments.trip_id and trips.owner_id = auth.uid()));
