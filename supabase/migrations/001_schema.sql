-- ============================================================
-- Map Cash — Schema completo para Supabase
-- Aplicar em: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (complementa auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null default '',
  avatar_url text,
  locale text default 'pt',
  currency text default 'BRL',
  created_at timestamptz default now()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('income','expense')) not null,
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  category text check (category in (
    'food','transport','housing','health','education',
    'entertainment','shopping','travel','salary',
    'freelance','investment','other'
  )) not null default 'other',
  date date not null,
  created_at timestamptz default now()
);

create index if not exists transactions_user_date on transactions(user_id, date desc);

-- ============================================================
-- BUDGETS
-- ============================================================
create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  month text not null, -- 'yyyy-MM'
  created_at timestamptz default now(),
  unique(user_id, category, month)
);

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0,
  target_date date,
  color text default '#007AFF',
  emoji text default '🎯',
  completed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- GOAL CONTRIBUTIONS
-- ============================================================
create table if not exists goal_contributions (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid references goals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- GROUPS
-- ============================================================
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  emoji text default '👥',
  created_by uuid references auth.users(id) on delete set null,
  invite_token text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
create table if not exists group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  role text check (role in ('admin','member')) default 'member',
  joined_at timestamptz default now(),
  constraint member_identity check (
    (user_id is not null and guest_name is null) or
    (user_id is null and guest_name is not null)
  )
);

create index if not exists group_members_group on group_members(group_id);
create index if not exists group_members_user on group_members(user_id);

-- ============================================================
-- GROUP EXPENSES
-- ============================================================
create table if not exists group_expenses (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  paid_by_user_id uuid references auth.users(id) on delete set null,
  paid_by_guest_name text,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz default now()
);

create index if not exists group_expenses_group on group_expenses(group_id);

-- ============================================================
-- GROUP EXPENSE SPLITS
-- ============================================================
create table if not exists group_expense_splits (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid references group_expenses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  guest_name text,
  amount numeric(12,2) not null,
  settled boolean default false,
  settled_at timestamptz
);

create index if not exists splits_expense on group_expense_splits(expense_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_expenses enable row level security;
alter table group_expense_splits enable row level security;

-- Profiles
create policy "profiles: own" on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles: readable by group members" on profiles for select using (
  user_id in (
    select user_id from group_members where group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  )
);

-- Transactions
create policy "transactions: own" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Budgets
create policy "budgets: own" on budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals
create policy "goals: own" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goal contributions
create policy "contributions: own" on goal_contributions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Groups: visible to members
create policy "groups: visible to members" on groups for select using (
  id in (select group_id from group_members where user_id = auth.uid())
);
create policy "groups: insert by auth" on groups for insert with check (auth.uid() = created_by);

-- Group members
create policy "members: visible in group" on group_members for select using (
  group_id in (select group_id from group_members where user_id = auth.uid())
  or user_id = auth.uid()
);
create policy "members: insert any" on group_members for insert with check (true);
create policy "members: delete own" on group_members for delete using (auth.uid() = user_id);

-- Group expenses
create policy "expenses: visible to members" on group_expenses for select using (
  group_id in (select group_id from group_members where user_id = auth.uid())
);
create policy "expenses: insert by members" on group_expenses for insert with check (
  group_id in (select group_id from group_members where user_id = auth.uid())
);

-- Splits
create policy "splits: visible to group members" on group_expense_splits for select using (
  expense_id in (
    select id from group_expenses where group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  )
);
create policy "splits: insert any" on group_expense_splits for insert with check (true);
create policy "splits: update own" on group_expense_splits for update using (auth.uid() = user_id);
