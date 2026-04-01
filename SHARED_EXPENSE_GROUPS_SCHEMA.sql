create extension if not exists pgcrypto;

create or replace function public.set_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_expense_group_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.owner_user_id = auth.uid();
  return new;
end;
$$;

create or replace function public.assign_expense_group_entry_creator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by = auth.uid();
  return new;
end;
$$;

create table if not exists public.expense_groups (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  currency text not null default 'EUR',
  default_split_mode text not null default 'weighted' check (default_split_mode in ('equal', 'weighted')),
  shared_account_enabled boolean not null default false,
  shared_account_name text,
  shared_account_balance numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.expense_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  email text,
  share_ratio numeric(10,4) not null default 1 check (share_ratio > 0),
  role text not null default 'member' check (role in ('owner', 'member')),
  color text,
  created_at timestamptz not null default now(),
  unique (group_id, display_name)
);

create unique index if not exists expense_group_members_user_unique
  on public.expense_group_members(group_id, user_id)
  where user_id is not null;

create table if not exists public.expense_group_entries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.expense_groups(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('expense', 'funding')),
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'EUR',
  entry_date date not null default current_date,
  paid_from text not null default 'member' check (paid_from in ('member', 'shared_account')),
  paid_by_member_id uuid references public.expense_group_members(id) on delete set null,
  is_recurring boolean not null default false,
  recurrence_pattern text check (
    recurrence_pattern in ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annually', 'yearly')
  ),
  recurrence_end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_group_entries_funding_requires_member
    check (
      entry_type <> 'funding'
      or (paid_from = 'member' and paid_by_member_id is not null)
    ),
  constraint expense_group_entries_shared_account_only_for_expense
    check (paid_from <> 'shared_account' or entry_type = 'expense')
);

create index if not exists expense_groups_owner_idx
  on public.expense_groups(owner_user_id, created_at desc);

create index if not exists expense_group_members_group_idx
  on public.expense_group_members(group_id, created_at asc);

create index if not exists expense_group_entries_group_date_idx
  on public.expense_group_entries(group_id, entry_date desc);

create index if not exists expense_group_entries_created_by_idx
  on public.expense_group_entries(created_by, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_expense_groups_updated_at'
  ) then
    create trigger set_expense_groups_updated_at
      before update on public.expense_groups
      for each row
      execute function public.set_timestamp_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'assign_expense_group_owner_before_insert'
  ) then
    create trigger assign_expense_group_owner_before_insert
      before insert on public.expense_groups
      for each row
      execute function public.assign_expense_group_owner();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'assign_expense_group_entry_creator_before_insert'
  ) then
    create trigger assign_expense_group_entry_creator_before_insert
      before insert on public.expense_group_entries
      for each row
      execute function public.assign_expense_group_entry_creator();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_expense_group_entries_updated_at'
  ) then
    create trigger set_expense_group_entries_updated_at
      before update on public.expense_group_entries
      for each row
      execute function public.set_timestamp_updated_at();
  end if;
end
$$;

create or replace function public.can_access_expense_group(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.expense_groups g
    where g.id = target_group_id
      and (
        g.owner_user_id = auth.uid()
        or exists (
          select 1
          from public.expense_group_members m
          where m.group_id = g.id
            and m.user_id = auth.uid()
        )
      )
  );
$$;

alter table public.expense_groups enable row level security;
alter table public.expense_group_members enable row level security;
alter table public.expense_group_entries enable row level security;

drop policy if exists "expense_groups_select" on public.expense_groups;
create policy "expense_groups_select"
  on public.expense_groups
  for select
  to authenticated
  using (
    owner_user_id = auth.uid()
    or exists (
      select 1
      from public.expense_group_members m
      where m.group_id = id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "expense_groups_insert" on public.expense_groups;
create policy "expense_groups_insert"
  on public.expense_groups
  for insert
  to authenticated
  with check (true);

drop policy if exists "expense_groups_update" on public.expense_groups;
create policy "expense_groups_update"
  on public.expense_groups
  for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "expense_groups_delete" on public.expense_groups;
create policy "expense_groups_delete"
  on public.expense_groups
  for delete
  using (owner_user_id = auth.uid());

drop policy if exists "expense_group_members_select" on public.expense_group_members;
create policy "expense_group_members_select"
  on public.expense_group_members
  for select
  using (public.can_access_expense_group(group_id));

drop policy if exists "expense_group_members_insert" on public.expense_group_members;
create policy "expense_group_members_insert"
  on public.expense_group_members
  for insert
  with check (
    exists (
      select 1
      from public.expense_groups g
      where g.id = group_id
        and g.owner_user_id = auth.uid()
    )
  );

drop policy if exists "expense_group_members_update" on public.expense_group_members;
create policy "expense_group_members_update"
  on public.expense_group_members
  for update
  using (
    exists (
      select 1
      from public.expense_groups g
      where g.id = group_id
        and g.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.expense_groups g
      where g.id = group_id
        and g.owner_user_id = auth.uid()
    )
  );

drop policy if exists "expense_group_members_delete" on public.expense_group_members;
create policy "expense_group_members_delete"
  on public.expense_group_members
  for delete
  using (
    exists (
      select 1
      from public.expense_groups g
      where g.id = group_id
        and g.owner_user_id = auth.uid()
    )
  );

drop policy if exists "expense_group_entries_select" on public.expense_group_entries;
create policy "expense_group_entries_select"
  on public.expense_group_entries
  for select
  using (public.can_access_expense_group(group_id));

drop policy if exists "expense_group_entries_insert" on public.expense_group_entries;
create policy "expense_group_entries_insert"
  on public.expense_group_entries
  for insert
  to authenticated
  with check (public.can_access_expense_group(group_id) and auth.uid() is not null);

drop policy if exists "expense_group_entries_update" on public.expense_group_entries;
create policy "expense_group_entries_update"
  on public.expense_group_entries
  for update
  using (public.can_access_expense_group(group_id))
  with check (public.can_access_expense_group(group_id));

drop policy if exists "expense_group_entries_delete" on public.expense_group_entries;
create policy "expense_group_entries_delete"
  on public.expense_group_entries
  for delete
  using (public.can_access_expense_group(group_id));
