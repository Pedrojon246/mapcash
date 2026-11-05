-- ============================================================
-- Map Cash — 005: permitir excluir grupo (admin / criador)
-- Aplicar em: Supabase Dashboard > SQL Editor > New Query (pode rodar mais de uma vez)
-- ============================================================

create or replace function public.is_group_admin(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_group_admin(uuid) to authenticated;

drop policy if exists "groups: delete by admin" on groups;
create policy "groups: delete by admin" on groups for delete using (
  created_by = auth.uid() or public.is_group_admin(id)
);
