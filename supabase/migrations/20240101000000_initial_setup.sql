-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create secure schema for auth-related functions
create schema if not exists auth;
grant usage on schema auth to public;

-- Create auth schema tables
create table if not exists auth.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  encrypted_password text,
  email_confirmed_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb default '{}'::jsonb,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  aud varchar(255) default 'authenticated'::character varying,
  role varchar(255) default 'authenticated'::character varying,
  provider varchar(255),
  provider_id text
);

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3)
);

-- Create videos table
create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  youtube_id text not null,
  category text not null,
  tags jsonb default '{}'::jsonb,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint title_length check (char_length(title) >= 3)
);

-- Create tag_groups table
create table if not exists public.tag_groups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  tags text[] default array[]::text[],
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint name_length check (char_length(name) >= 2)
);

-- Create galleries table
create table if not exists public.galleries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text not null,
  category text not null unique,
  is_public boolean default true,
  icon text not null default 'video',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint name_length check (char_length(name) >= 3),
  constraint category_length check (char_length(category) >= 3)
);

-- Create indexes
create index if not exists users_email_idx on auth.users (email);
create index if not exists users_provider_id_idx on auth.users (provider, provider_id);
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists videos_user_id_idx on public.videos (user_id);
create index if not exists videos_category_idx on public.videos (category);
create index if not exists videos_is_public_idx on public.videos (is_public);
create index if not exists tag_groups_user_id_idx on public.tag_groups (user_id);
create index if not exists tag_groups_category_idx on public.tag_groups (category);
create index if not exists galleries_user_id_idx on public.galleries (user_id);
create index if not exists galleries_category_idx on public.galleries (category);
create index if not exists galleries_is_public_idx on public.galleries (is_public);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.tag_groups enable row level security;
alter table public.galleries enable row level security;

-- Create policies
-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Videos policies
create policy "Public videos are viewable by everyone"
  on public.videos for select
  using (is_public = true);

create policy "Users can view all videos when authenticated"
  on public.videos for select
  using (auth.role() = 'authenticated');

create policy "Users can insert videos"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own videos"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "Users can delete own videos"
  on public.videos for delete
  using (auth.uid() = user_id);

-- Tag groups policies
create policy "Tag groups are viewable by everyone"
  on public.tag_groups for select
  using (true);

create policy "Users can insert tag groups"
  on public.tag_groups for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tag groups"
  on public.tag_groups for update
  using (auth.uid() = user_id);

create policy "Users can delete own tag groups"
  on public.tag_groups for delete
  using (auth.uid() = user_id);

-- Galleries policies
create policy "Public galleries are viewable by everyone"
  on public.galleries for select
  using (is_public = true);

create policy "Users can view all galleries when authenticated"
  on public.galleries for select
  using (auth.role() = 'authenticated');

create policy "Users can create galleries"
  on public.galleries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own galleries"
  on public.galleries for update
  using (auth.uid() = user_id);

create policy "Users can delete own galleries"
  on public.galleries for delete
  using (auth.uid() = user_id);

-- Create functions
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
declare
  username text;
begin
  -- Get username from metadata or generate one from email
  username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'user_' || gen_random_uuid()
  );

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    username,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace function public.handle_updated_at()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_videos_updated_at
  before update on public.videos
  for each row execute procedure public.handle_updated_at();

create trigger handle_tag_groups_updated_at
  before update on public.tag_groups
  for each row execute procedure public.handle_updated_at();

create trigger handle_galleries_updated_at
  before update on public.galleries
  for each row execute procedure public.handle_updated_at();