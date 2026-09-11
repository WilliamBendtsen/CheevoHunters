insert into users (id, username, display_name, email) values
  ('00000000-0000-4000-8000-000000000001', 'pixelpulse', 'PixelPulse', 'pixelpulse@example.com'),
  ('00000000-0000-4000-8000-000000000002', 'achihunter99', 'AchiHunter99', null),
  ('00000000-0000-4000-8000-000000000003', 'sgtpepper', 'SgtPepper', null),
  ('00000000-0000-4000-8000-000000000004', 'lootrunner', 'LootRunner', null)
on conflict (username) do nothing;

insert into platforms (id, name, slug) values
  ('10000000-0000-4000-8000-000000000001', 'PC', 'pc'),
  ('10000000-0000-4000-8000-000000000002', 'PlayStation 5', 'ps5'),
  ('10000000-0000-4000-8000-000000000003', 'Xbox Series X/S', 'xbox-series'),
  ('10000000-0000-4000-8000-000000000004', 'Crossplay', 'crossplay')
on conflict (slug) do nothing;

insert into games (
  id,
  igdb_id,
  title,
  slug,
  cover_url,
  active_players_label,
  follower_count
) values
  ('20000000-0000-4000-8000-000000000001', 250616, 'Helldivers 2', 'helldivers-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/coabbf.jpg', '142k', 12400),
  ('20000000-0000-4000-8000-000000000002', 212089, 'Lethal Company', 'lethal-company', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5ive.jpg', '45k', 8800),
  ('20000000-0000-4000-8000-000000000003', 119133, 'Elden Ring', 'elden-ring', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg', '89k', 18900),
  ('20000000-0000-4000-8000-000000000004', 27134, 'Deep Rock Galactic', 'deep-rock-galactic', 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaat4.jpg', '22k', 6200),
  ('20000000-0000-4000-8000-000000000005', 72, 'Portal 2', 'portal-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rs4.jpg', '8k', 3700),
  ('20000000-0000-4000-8000-000000000006', 279661, 'Monster Hunter Wilds', 'monster-hunter-wilds', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co904o.jpg', '165k', 21600)
on conflict (slug) do update set
  igdb_id = excluded.igdb_id,
  cover_url = excluded.cover_url,
  updated_at = now();

insert into game_platforms (game_id, platform_id) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into sessions (
  id,
  game_id,
  platform_id,
  host_user_id,
  title,
  description,
  requirements,
  session_type,
  status,
  max_players
) values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'Need ''All Guns Blazing'' Achievement (DLC)',
    'Looking for focused players to run "Need ''All Guns Blazing'' Achievement (DLC)" in Helldivers 2. Bring a reliable loadout and be ready to coordinate around the session goals.',
    'Must have Discord & voice enabled. DLC installed.',
    'achievement',
    'open',
    4
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000003',
    'Hardcore Campaign Co-op from Start',
    'Looking for focused players to run "Hardcore Campaign Co-op from Start" in Helldivers 2. Bring a reliable loadout and be ready to coordinate around the session goals.',
    'Must have Discord & voice enabled. DLC installed.',
    'coop',
    'open',
    4
  )
on conflict (id) do nothing;

insert into session_members (session_id, user_id, role, status, joined_at) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'host', 'joined', now()),
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'member', 'joined', now()),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'host', 'joined', now())
on conflict (session_id, user_id) do nothing;

insert into game_follows (user_id, game_id, notifications_enabled) values
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', false),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', true)
on conflict (user_id, game_id) do nothing;
