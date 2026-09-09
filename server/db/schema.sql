create extension if not exists "pgcrypto";

do $$ begin
  create type session_type as enum (
    'achievement',
    'coop',
    'competitive',
    'casual'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type session_status as enum (
    'open',
    'full',
    'in_progress',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type member_role as enum (
    'host',
    'member'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type member_status as enum (
    'joined',
    'pending',
    'rejected',
    'left'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  email text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  igdb_id integer unique,
  title text not null,
  slug text not null unique,
  cover_url text,
  active_players_label text,
  session_count integer not null default 0,
  follower_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists game_platforms (
  game_id uuid not null references games(id) on delete cascade,
  platform_id uuid not null references platforms(id) on delete cascade,
  primary key (game_id, platform_id)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  platform_id uuid references platforms(id) on delete set null,
  host_user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  requirements text,
  session_type session_type not null,
  status session_status not null default 'open',
  scheduled_at timestamptz,
  time_label text,
  max_players integer not null check (max_players between 2 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists session_members (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role member_role not null default 'member',
  status member_status not null default 'pending',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  message text not null,
  time_label text,
  created_at timestamptz not null default now()
);

create table if not exists game_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  game_id uuid not null references games(id) on delete cascade,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create index if not exists games_title_idx on games using gin (to_tsvector('english', title));
create index if not exists sessions_game_id_idx on sessions(game_id);
create index if not exists sessions_platform_id_idx on sessions(platform_id);
create index if not exists sessions_status_idx on sessions(status);
create index if not exists sessions_scheduled_at_idx on sessions(scheduled_at);
create index if not exists session_members_session_id_idx on session_members(session_id);
create index if not exists session_members_user_id_idx on session_members(user_id);
create index if not exists chat_messages_session_id_created_at_idx on chat_messages(session_id, created_at);

alter table games add column if not exists session_count integer not null default 0;
alter table sessions add column if not exists time_label text;
alter table chat_messages add column if not exists time_label text;
