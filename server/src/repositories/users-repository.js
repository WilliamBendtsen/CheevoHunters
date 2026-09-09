import { db } from "../db/client.js";
import { toApiGameId, toApiSessionId } from "../db/legacy-id.js";
import { toSessionTone, toSessionTypeLabel } from "../models/session-model.js";
import { serializeUser } from "../serializers/user-serializer.js";

export const usersRepository = {
  async findMockCurrentUser() {
    const { rows } = await db.query(
      `
        select id, username, display_name, email, avatar_url
        from users
        where username = 'pixelpulse'
        limit 1
      `,
    );

    return rows[0] ? serializeUser(toUserModel(rows[0])) : undefined;
  },

  async findDashboard(userId) {
    const [stats, upcomingSessions, followingGames] = await Promise.all([
      findStats(userId),
      findUpcomingSessions(userId),
      findFollowingGames(userId),
    ]);

    return {
      stats,
      upcomingSessions,
      followingGames,
    };
  },
};

async function findStats(userId) {
  const { rows } = await db.query(
    `
      select
        (
          select count(*)::int
          from session_members
          where user_id = $1
            and status = 'joined'
        ) as sessions_joined,
        (
          select count(*)::int
          from sessions
          where host_user_id = $1
        ) as sessions_created,
        (
          select count(*)::int
          from game_follows
          where user_id = $1
        ) as games_followed
    `,
    [userId],
  );

  return {
    sessionsJoined: rows[0].sessions_joined,
    sessionsCreated: rows[0].sessions_created,
    gamesFollowed: rows[0].games_followed,
  };
}

async function findUpcomingSessions(userId) {
  const { rows } = await db.query(
    `
      select
        s.id,
        s.title,
        s.session_type,
        s.time_label,
        g.title as game_title,
        p.name as platform_name
      from session_members sm
      join sessions s on s.id = sm.session_id
      join games g on g.id = s.game_id
      left join platforms p on p.id = s.platform_id
      where sm.user_id = $1
        and sm.status = 'joined'
        and s.status in ('open', 'full', 'in_progress')
      order by coalesce(s.scheduled_at, s.created_at) desc
      limit 5
    `,
    [userId],
  );

  return rows.map((row) => ({
    type: toSessionTypeLabel(row.session_type),
    tone: toSessionTone(row.session_type),
    platform: row.platform_name,
    game: row.game_title,
    title: row.title,
    starts: row.time_label ?? "Flexible Time",
    to: `/session/${toApiSessionId(row.id)}`,
  }));
}

async function findFollowingGames(userId) {
  const { rows } = await db.query(
    `
      select
        gf.notifications_enabled,
        g.id,
        g.title
      from game_follows gf
      join games g on g.id = gf.game_id
      where gf.user_id = $1
      order by g.title
    `,
    [userId],
  );

  return rows.map((row) => ({
    title: row.title,
    to: `/games/${toApiGameId(row.id)}`,
    enabled: row.notifications_enabled,
  }));
}

function toUserModel(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
  };
}
