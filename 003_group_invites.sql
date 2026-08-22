-- ============================================================
-- Map Cash — group_invites table
-- Aplicar em: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

create table if not exists group_invites (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  invited_email text not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz default now(),
  responded_at timestamptz,
  unique(group_id, invited_email)
);

create index if not exists group_invites_email on group_invites(invited_email);
create index if not exists group_invites_group on group_invites(group_id);

alter table group_invites enable row level security;

-- Invited user can see their own invites (match by email)
create policy "invites: see own" on group_invites for select using (
  invited_email = (select email from auth.users where id = auth.uid())
);

-- Group members can see invites for their group
create policy "invites: group members see" on group_invites for select using (
  group_id in (select group_id from group_members where user_id = auth.uid())
);

-- Any auth user can create an invite if they are in the group
create policy "invites: insert by member" on group_invites for insert with check (
  auth.uid() = invited_by
  and group_id in (select group_id from group_members where user_id = auth.uid())
);

-- Invited user can update their own invite (accept/decline)
create policy "invites: update own" on group_invites for update using (
  invited_email = (select email from auth.users where id = auth.uid())
);
