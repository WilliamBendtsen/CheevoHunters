import { db } from "../db/client.js";
import {
  createNewId,
  resolveGameId,
  resolveSessionId,
  toApiGameId,
  toApiSessionId,
} from "../db/legacy-id.js";
import { toPlatformSlug } from "../models/platform-model.js";
import { MEMBER_ROLES, MEMBER_STATUSES } from "../models/session-model.js";
import { serializeSession } from "../serializers/session-serializer.js";

export const sessionsRepository = {
  async findAll() {
    const { rows } = await db.query(`
      select
        s.*,
        g.id as game_id,
        g.title as game_title,
        g.cover_url as game_cover_url,
        p.id as platform_id,
        p.name as platform_name,
        p.slug as platform_slug,
        u.id as host_id,
        u.username as host_username,
        u.display_name as host_display_name,
        u.email as host_email
      from sessions s
      join games g on g.id = s.game_id
      left join platforms p on p.id = s.platform_id
      join users u on u.id = s.host_user_id
      order by s.created_at desc
    `);

    return hydrateSessions(rows);
  },

  async findById(sessionId) {
    const { rows } = await db.query(
      `
        select
          s.*,
          g.id as game_id,
          g.title as game_title,
          g.cover_url as game_cover_url,
          p.id as platform_id,
          p.name as platform_name,
          p.slug as platform_slug,
          u.id as host_id,
          u.username as host_username,
          u.display_name as host_display_name,
          u.email as host_email
        from sessions s
        join games g on g.id = s.game_id
        left join platforms p on p.id = s.platform_id
        join users u on u.id = s.host_user_id
        where s.id = $1
        limit 1
      `,
      [resolveSessionId(sessionId)],
    );

    const [session] = await hydrateSessions(rows);
    return session;
  },

  async createMessage(sessionId, userId, message) {
    const { rows } = await db.query(
      `insert into chat_messages (session_id, user_id, message)
       values ($1, $2, $3) returning id`,
      [resolveSessionId(sessionId), userId, message],
    );
    const session = await sessionsRepository.findById(sessionId);
    return session.chat.find((item) => item.id === rows[0].id);
  },

  async create(session) {
    const client = await db.connect();

    try {
      await client.query("begin");

      const platformSlug = toPlatformSlug(session.platform);
      const { rows: platformRows } = await client.query(
        "select id from platforms where slug = $1 limit 1",
        [platformSlug],
      );

      if (!platformRows[0]) {
        throw new Error(`Platform not found: ${session.platform}`);
      }

      const sessionId = createNewId();
      await client.query(
        `
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
            time_label,
            max_players
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $10)
        `,
        [
          sessionId,
          resolveGameId(session.gameId),
          platformRows[0].id,
          session.hostUserId,
          session.title,
          session.description,
          session.requirements,
          session.sessionType,
          session.time,
          session.maxPlayers,
        ],
      );

      await client.query(
        `
          insert into session_members (
            id,
            session_id,
            user_id,
            role,
            status,
            joined_at
          )
          values ($1, $2, $3, $4, $5, now())
        `,
        [
          createNewId(),
          sessionId,
          session.hostUserId,
          MEMBER_ROLES.host,
          MEMBER_STATUSES.joined,
        ],
      );

      await client.query("commit");
      return sessionsRepository.findById(sessionId);
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  },
};

async function hydrateSessions(sessionRows) {
  if (sessionRows.length === 0) {
    return [];
  }

  const sessionIds = sessionRows.map((session) => session.id);
  const [membersBySessionId, messagesBySessionId] = await Promise.all([
    findMembersBySessionIds(sessionIds),
    findMessagesBySessionIds(sessionIds),
  ]);

  return sessionRows.map((row) =>
    serializeSession({
      id: row.id,
      legacyId: toApiSessionId(row.id),
      game: {
        id: row.game_id,
        legacyId: toApiGameId(row.game_id),
        title: row.game_title,
        coverUrl: row.game_cover_url,
      },
      platform: {
        id: row.platform_id,
        name: row.platform_name,
        slug: row.platform_slug,
      },
      host: {
        id: row.host_id,
        username: row.host_username,
        displayName: row.host_display_name,
        email: row.host_email,
      },
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      sessionType: row.session_type,
      status: row.status,
      scheduledAt: row.scheduled_at,
      timeLabel: row.time_label,
      maxPlayers: row.max_players,
      members: membersBySessionId.get(row.id) ?? [],
      chatMessages: messagesBySessionId.get(row.id) ?? [],
    }),
  );
}

async function findMembersBySessionIds(sessionIds) {
  const { rows } = await db.query(
    `
      select
        sm.*,
        u.username,
        u.display_name,
        u.email,
        u.avatar_url
      from session_members sm
      join users u on u.id = sm.user_id
      where sm.session_id = any($1::uuid[])
      order by
        case when sm.role = 'host' then 0 else 1 end,
        sm.created_at
    `,
    [sessionIds],
  );

  return groupRows(rows, (row) => row.session_id, (row) => ({
    id: row.id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    user: {
      id: row.user_id,
      username: row.username,
      displayName: row.display_name,
      email: row.email,
      avatarUrl: row.avatar_url,
    },
  }));
}

async function findMessagesBySessionIds(sessionIds) {
  const { rows } = await db.query(
    `
      select
        cm.*,
        u.username,
        u.display_name,
        u.email,
        u.avatar_url
      from chat_messages cm
      join users u on u.id = cm.user_id
      where cm.session_id = any($1::uuid[])
      order by cm.created_at
    `,
    [sessionIds],
  );

  return groupRows(rows, (row) => row.session_id, (row) => ({
    id: row.id,
    message: row.message,
    timeLabel: row.time_label,
    createdAt: row.created_at,
    user: {
      id: row.user_id,
      username: row.username,
      displayName: row.display_name,
      email: row.email,
      avatarUrl: row.avatar_url,
    },
  }));
}

function groupRows(rows, getKey, mapRow) {
  const grouped = new Map();

  for (const row of rows) {
    const key = getKey(row);
    const group = grouped.get(key) ?? [];
    group.push(mapRow(row));
    grouped.set(key, group);
  }

  return grouped;
}
