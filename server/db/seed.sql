insert into users (id, username, display_name, email) values
  ('a1fb50ef-5c45-554a-999e-6835a1a94d9c', 'pixelpulse', 'PixelPulse', 'pixelpulse@example.com'),
  ('99b3c00a-55ce-5624-a3ee-3e831d23136f', 'achihunter99', 'AchiHunter99', null),
  ('56352c58-e033-5556-969d-ceb9c993dfc0', 'sgtpepper', 'SgtPepper', null),
  ('4d27c650-6d5d-5134-a97b-9775ca878761', 'lootrunner', 'LootRunner', null)
on conflict (username) do nothing;

insert into platforms (id, name, slug) values
  ('430330c4-4fdd-5a7a-91b1-29b7e36021ee', 'PC', 'pc'),
  ('21776c0d-45d7-53b6-84cb-7af290d58c96', 'PS5', 'ps5'),
  ('681389b1-ea29-5da7-8eb3-44213955b8b3', 'Xbox', 'xbox-series'),
  ('adfb193f-28eb-5e17-8412-dd618a1889e3', 'Crossplay', 'crossplay')
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
  ('7c5bd69c-0e6f-553d-84a2-29a430dc5d6f', 250616, 'Helldivers 2', 'helldivers-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/coabbf.jpg', '142k', 12400),
  ('4918e516-797a-5144-b6ac-cb4e56a5f713', 212089, 'Lethal Company', 'lethal-company', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5ive.jpg', '45k', 8800),
  ('ee3e9c3b-1ab1-5482-a084-2b41c546ec79', 119133, 'Elden Ring', 'elden-ring', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg', '89k', 18900),
  ('8893e6a9-10ea-5f1c-81aa-37f3256180e0', 27134, 'Deep Rock Galactic', 'deep-rock-galactic', 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaat4.jpg', '22k', 6200),
  ('2f5d7807-3d80-55a5-a93c-68ee02184862', 72, 'Portal 2', 'portal-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rs4.jpg', '8k', 3700),
  ('69240b9b-972b-57f9-806c-66bd648f2bfe', 279661, 'Monster Hunter Wilds', 'monster-hunter-wilds', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co904o.jpg', '165k', 21600),
  ('c8bf6295-92c3-5d61-8e4a-17eed388858c', 119171, 'Baldur''s Gate III', 'baldurs-gate-iii', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg', '71k', 16400),
  ('9a33583d-5101-5e0e-8f68-1298e535c9f7', 11137, 'Sea of Thieves', 'sea-of-thieves', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2558.jpg', '38k', 9700)
on conflict (slug) do update set
  igdb_id = excluded.igdb_id,
  cover_url = excluded.cover_url,
  updated_at = now();

insert into game_platforms (game_id, platform_id) values
  ('7c5bd69c-0e6f-553d-84a2-29a430dc5d6f', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('7c5bd69c-0e6f-553d-84a2-29a430dc5d6f', '21776c0d-45d7-53b6-84cb-7af290d58c96'),
  ('4918e516-797a-5144-b6ac-cb4e56a5f713', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('ee3e9c3b-1ab1-5482-a084-2b41c546ec79', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('ee3e9c3b-1ab1-5482-a084-2b41c546ec79', '21776c0d-45d7-53b6-84cb-7af290d58c96'),
  ('ee3e9c3b-1ab1-5482-a084-2b41c546ec79', '681389b1-ea29-5da7-8eb3-44213955b8b3'),
  ('8893e6a9-10ea-5f1c-81aa-37f3256180e0', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('8893e6a9-10ea-5f1c-81aa-37f3256180e0', '681389b1-ea29-5da7-8eb3-44213955b8b3'),
  ('2f5d7807-3d80-55a5-a93c-68ee02184862', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('69240b9b-972b-57f9-806c-66bd648f2bfe', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('69240b9b-972b-57f9-806c-66bd648f2bfe', '21776c0d-45d7-53b6-84cb-7af290d58c96'),
  ('69240b9b-972b-57f9-806c-66bd648f2bfe', '681389b1-ea29-5da7-8eb3-44213955b8b3'),
  ('c8bf6295-92c3-5d61-8e4a-17eed388858c', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('c8bf6295-92c3-5d61-8e4a-17eed388858c', '21776c0d-45d7-53b6-84cb-7af290d58c96'),
  ('c8bf6295-92c3-5d61-8e4a-17eed388858c', '681389b1-ea29-5da7-8eb3-44213955b8b3'),
  ('9a33583d-5101-5e0e-8f68-1298e535c9f7', '430330c4-4fdd-5a7a-91b1-29b7e36021ee'),
  ('9a33583d-5101-5e0e-8f68-1298e535c9f7', '21776c0d-45d7-53b6-84cb-7af290d58c96'),
  ('9a33583d-5101-5e0e-8f68-1298e535c9f7', '681389b1-ea29-5da7-8eb3-44213955b8b3')
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
    '24b89897-1bea-5c97-857b-5c8222bafb98',
    '7c5bd69c-0e6f-553d-84a2-29a430dc5d6f',
    '430330c4-4fdd-5a7a-91b1-29b7e36021ee',
    '99b3c00a-55ce-5624-a3ee-3e831d23136f',
    'Need ''All Guns Blazing'' Achievement (DLC)',
    'Looking for focused players to run "Need ''All Guns Blazing'' Achievement (DLC)" in Helldivers 2. Bring a reliable loadout and be ready to coordinate around the session goals.',
    'Must have Discord & voice enabled. DLC installed.',
    'achievement',
    'open',
    4
  ),
  (
    '2580c2f4-be09-5064-a9e7-7dcf143bd21f',
    '7c5bd69c-0e6f-553d-84a2-29a430dc5d6f',
    'adfb193f-28eb-5e17-8412-dd618a1889e3',
    '56352c58-e033-5556-969d-ceb9c993dfc0',
    'Hardcore Campaign Co-op from Start',
    'Looking for focused players to run "Hardcore Campaign Co-op from Start" in Helldivers 2. Bring a reliable loadout and be ready to coordinate around the session goals.',
    'Must have Discord & voice enabled. DLC installed.',
    'coop',
    'open',
    4
  )
on conflict (id) do nothing;

insert into session_members (session_id, user_id, role, status, joined_at) values
  ('24b89897-1bea-5c97-857b-5c8222bafb98', '99b3c00a-55ce-5624-a3ee-3e831d23136f', 'host', 'joined', now()),
  ('24b89897-1bea-5c97-857b-5c8222bafb98', 'a1fb50ef-5c45-554a-999e-6835a1a94d9c', 'member', 'joined', now()),
  ('2580c2f4-be09-5064-a9e7-7dcf143bd21f', '56352c58-e033-5556-969d-ceb9c993dfc0', 'host', 'joined', now())
on conflict (session_id, user_id) do nothing;

insert into game_follows (user_id, game_id, notifications_enabled) values
  ('a1fb50ef-5c45-554a-999e-6835a1a94d9c', '7c5bd69c-0e6f-553d-84a2-29a430dc5d6f', true),
  ('a1fb50ef-5c45-554a-999e-6835a1a94d9c', '4918e516-797a-5144-b6ac-cb4e56a5f713', false),
  ('a1fb50ef-5c45-554a-999e-6835a1a94d9c', '69240b9b-972b-57f9-806c-66bd648f2bfe', true)
on conflict (user_id, game_id) do nothing;
