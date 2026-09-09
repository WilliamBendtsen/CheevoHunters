import { db } from "../db/client.js";
import { resolveGameId, toApiGameId } from "../db/legacy-id.js";
import { serializeGame } from "../serializers/game-serializer.js";

export const gamesRepository = {
  async findAll() {
    const { rows } = await db.query(`
      select
        g.*,
        coalesce(
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'slug', p.slug
            )
            order by p.name
          ) filter (where p.id is not null),
          '[]'
        ) as platforms
      from games g
      left join game_platforms gp on gp.game_id = g.id
      left join platforms p on p.id = gp.platform_id
      group by g.id
      order by g.title
    `);

    const sessionsByGameId = await findSessionsByGameIds(rows.map((game) => game.id));

    return rows.map((game) =>
      serializeGame(toGameModel(game, sessionsByGameId.get(game.id) ?? [])),
    );
  },

  async findById(gameId) {
    const game = await findGameRecord(gameId);

    if (!game) {
      return undefined;
    }

    const sessionsByGameId = await findSessionsByGameIds([game.id]);
    return serializeGame(toGameModel(game, sessionsByGameId.get(game.id) ?? []));
  },

  async findRecordById(gameId) {
    return findGameRecord(gameId);
  },
};

async function findGameRecord(gameId) {
  const { rows } = await db.query(
    `
      select
        g.*,
        coalesce(
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'slug', p.slug
            )
            order by p.name
          ) filter (where p.id is not null),
          '[]'
        ) as platforms
      from games g
      left join game_platforms gp on gp.game_id = g.id
      left join platforms p on p.id = gp.platform_id
      where g.id = $1
      group by g.id
      limit 1
    `,
    [resolveGameId(gameId)],
  );

  return rows[0];
}

async function findSessionsByGameIds(gameIds) {
  if (gameIds.length === 0) {
    return new Map();
  }

  const { rows } = await db.query(
    `
      select
        s.*,
        g.id as game_id,
        g.title as game_title,
        p.id as platform_id,
        p.name as platform_name,
        p.slug as platform_slug,
        u.id as host_id,
        u.username as host_username,
        u.display_name as host_display_name,
        u.email as host_email,
        count(sm.id) filter (where sm.status = 'joined')::int as joined_count
      from sessions s
      join games g on g.id = s.game_id
      left join platforms p on p.id = s.platform_id
      join users u on u.id = s.host_user_id
      left join session_members sm on sm.session_id = s.id
      where s.game_id = any($1::uuid[])
      group by s.id, g.id, p.id, u.id
      order by s.created_at desc
    `,
    [gameIds],
  );

  const grouped = new Map();

  for (const row of rows) {
    const session = toSessionSummary(row);
    const sessions = grouped.get(row.game_id) ?? [];
    sessions.push(session);
    grouped.set(row.game_id, sessions);
  }

  return grouped;
}

function toGameModel(row, detailSessions) {
  return {
    id: row.id,
    legacyId: toApiGameId(row.id),
    title: row.title,
    slug: row.slug,
    coverUrl: row.cover_url,
    activePlayersLabel: row.active_players_label,
    sessionCount: row.session_count,
    followerCount: row.follower_count,
    platforms: row.platforms,
    detailSessions,
  };
}

function toSessionSummary(row) {
  return {
    id: row.id,
    sessionType: row.session_type,
    platform: {
      id: row.platform_id,
      name: row.platform_name,
      slug: row.platform_slug,
    },
    timeLabel: row.time_label,
    title: row.title,
    host: {
      id: row.host_id,
      username: row.host_username,
      displayName: row.host_display_name,
      email: row.host_email,
    },
    maxPlayers: row.max_players,
    members: Array.from({ length: row.joined_count }, (_, index) => ({
      status: "joined",
      user: {
        displayName: index === 0 ? row.host_display_name : "Joined Player",
      },
    })),
    game: {
      id: row.game_id,
      legacyId: toApiGameId(row.game_id),
      title: row.game_title,
    },
    description: row.description,
    requirements: row.requirements,
    chatMessages: [],
  };
}
