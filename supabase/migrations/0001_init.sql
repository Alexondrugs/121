-- Schemas & tables for Wedding Project Manager

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.roles (
  id serial primary key,
  name text unique not null -- administrator, manager, montazhnik, florist, designer, custom
);

create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role_id int references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','manager','executor')),
  primary key (project_id, user_id)
);

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  position int not null
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  column_id uuid references public.columns(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  position int not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.task_assignees (
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (task_id, user_id)
);

create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  position int not null
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  total numeric(12,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid references public.estimates(id) on delete cascade,
  title text not null,
  qty numeric(12,2) not null,
  price numeric(12,2) not null,
  position int not null
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- RLS
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_checklist_items enable row level security;
alter table public.comments enable row level security;
alter table public.project_messages enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;
alter table public.push_subscriptions enable row level security;

-- Helper: is project member
create or replace view public.v_project_membership as
  select pm.project_id, pm.user_id, pm.role from public.project_members pm;

-- Policies: project visibility to members
create policy proj_select_members on public.projects
  for select using (exists(
    select 1 from public.project_members m
    where m.project_id = projects.id and m.user_id = auth.uid()
  ));

create policy proj_insert_admin_mgr on public.projects
  for insert with check (auth.uid() = created_by);

create policy proj_update_admin_mgr on public.projects
  for update using (exists(
    select 1 from public.project_members m where m.project_id = projects.id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));

create policy proj_delete_admin_mgr on public.projects
  for delete using (exists(
    select 1 from public.project_members m where m.project_id = projects.id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));

-- Columns
create policy col_crud_members on public.columns
  for select using (exists(select 1 from public.project_members m where m.project_id = columns.project_id and m.user_id = auth.uid()));
create policy col_ins_admin_mgr on public.columns
  for insert with check (exists(select 1 from public.project_members m where m.project_id = columns.project_id and m.user_id = auth.uid() and m.role in ('admin','manager')));
create policy col_upd_admin_mgr on public.columns
  for update using (exists(select 1 from public.project_members m where m.project_id = columns.project_id and m.user_id = auth.uid() and m.role in ('admin','manager')));
create policy col_del_admin_mgr on public.columns
  for delete using (exists(select 1 from public.project_members m where m.project_id = columns.project_id and m.user_id = auth.uid() and m.role in ('admin','manager')));

-- Tasks
create policy task_select_members on public.tasks
  for select using (exists(select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid()));
create policy task_ins_admin_mgr on public.tasks
  for insert with check (exists(select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid() and m.role in ('admin','manager')));
create policy task_upd_admin_mgr on public.tasks
  for update using (exists(select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid() and m.role in ('admin','manager')));

-- Task assignees (managers control assignments)
create policy assgn_select_members on public.task_assignees
  for select using (exists(
    select 1 from public.tasks t join public.project_members m on m.project_id = t.project_id
    where t.id = task_assignees.task_id and m.user_id = auth.uid()
  ));
create policy assgn_crud_mgr on public.task_assignees
  for all using (exists(
    select 1 from public.tasks t join public.project_members m on m.project_id = t.project_id
    where t.id = task_assignees.task_id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));

-- Checklist: executors can toggle/update title for assigned tasks
create policy checklist_select_members on public.task_checklist_items
  for select using (exists(
    select 1 from public.tasks t join public.project_members m on m.project_id = t.project_id
    where t.id = task_checklist_items.task_id and m.user_id = auth.uid()
  ));
create policy checklist_ins_mgr on public.task_checklist_items
  for insert with check (exists(
    select 1 from public.tasks t join public.project_members m on m.project_id = t.project_id
    where t.id = task_checklist_items.task_id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));
create policy checklist_upd_mgr_or_exec on public.task_checklist_items
  for update using (
    exists(
      select 1 from public.tasks t
      join public.project_members m on m.project_id = t.project_id
      where t.id = task_checklist_items.task_id and m.user_id = auth.uid() and m.role in ('admin','manager')
    )
    or exists(
      select 1 from public.task_assignees a where a.task_id = task_checklist_items.task_id and a.user_id = auth.uid()
    )
  );
create policy checklist_del_mgr on public.task_checklist_items
  for delete using (exists(
    select 1 from public.tasks t join public.project_members m on m.project_id = t.project_id
    where t.id = task_checklist_items.task_id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));

-- Comments & messages (members only)
create policy comments_crud_members on public.comments
  for all using (exists(
    select 1 from public.tasks t join public.project_members m on m.project_id = t.project_id
    where t.id = comments.task_id and m.user_id = auth.uid()
  )) with check (true);

create policy messages_crud_members on public.project_messages
  for all using (exists(
    select 1 from public.project_members m where m.project_id = project_messages.project_id and m.user_id = auth.uid()
  )) with check (true);

-- Estimates visible and editable to managers/admins; visible to members
create policy estimate_select_members on public.estimates
  for select using (exists(
    select 1 from public.project_members m where m.project_id = estimates.project_id and m.user_id = auth.uid()
  ));
create policy estimate_crud_mgr on public.estimates
  for all using (exists(
    select 1 from public.project_members m where m.project_id = estimates.project_id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));

create policy estimate_items_select_members on public.estimate_items
  for select using (exists(
    select 1 from public.estimates e join public.project_members m on m.project_id = e.project_id
    where e.id = estimate_items.estimate_id and m.user_id = auth.uid()
  ));
create policy estimate_items_crud_mgr on public.estimate_items
  for all using (exists(
    select 1 from public.estimates e join public.project_members m on m.project_id = e.project_id
    where e.id = estimate_items.estimate_id and m.user_id = auth.uid() and m.role in ('admin','manager')
  ));

-- Push subscriptions for current user only
create policy push_self on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


