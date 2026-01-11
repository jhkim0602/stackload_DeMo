-- Create projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text check (type in ('hackathon', 'study', 'side-project')),
  status text check (status in ('live', 'completed', 'archived')) default 'live',
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create project_members table
create table if not exists project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text check (role in ('leader', 'member', 'viewer')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Enable RLS
alter table projects enable row level security;
alter table project_members enable row level security;

-- Policies for projects

-- 1. SELECT: Users can see projects they are members of
create policy "Users can see projects they are members of"
  on projects for select
  using (
    auth.uid() in (
        select user_id from project_members where project_id = id
    )
  );

-- 2. INSERT: Authenticated users can create projects
create policy "Authenticated users can create projects"
  on projects for insert
  with check (
    auth.role() = 'authenticated'
  );

-- 3. UPDATE: Only the owner can update the project
create policy "Owners can update their projects"
  on projects for update
  using (
    auth.uid() = owner_id
  );

-- 4. DELETE: Only the owner can delete the project
create policy "Owners can delete their projects"
  on projects for delete
  using (
    auth.uid() = owner_id
  );

-- Policies for project_members

-- 1. SELECT: Users can see members of projects they belong to (or their own membership)
create policy "Users can view members of their projects"
  on project_members for select
  using (
      user_id = auth.uid()
      or
      project_id in (
          select project_id from project_members where user_id = auth.uid()
      )
  );

-- 2. INSERT: Only project owners can add members
create policy "Project owners can add members"
  on project_members for insert
  with check (
      project_id in (
          select id from projects where owner_id = auth.uid()
      )
  );

-- 3. UPDATE: Only project owners can update members
create policy "Project owners can update members"
  on project_members for update
  using (
      project_id in (
          select id from projects where owner_id = auth.uid()
      )
  );

-- 4. DELETE: Only project owners can remove members
create policy "Project owners can remove members"
  on project_members for delete
  using (
      project_id in (
          select id from projects where owner_id = auth.uid()
      )
  );
