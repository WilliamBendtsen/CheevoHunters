import {
  MEMBER_ROLES,
  MEMBER_STATUSES,
} from "../models/session-model.js";
import { games as legacyGames, sessions as legacySessions } from "./mock-data.js";

const platformSeeds = [
  { id: "platform-pc", name: "PC", slug: "pc" },
  { id: "platform-ps5", name: "PS5", slug: "ps5" },
  { id: "platform-xbox", name: "Xbox", slug: "xbox-series" },
  { id: "platform-crossplay", name: "Crossplay", slug: "crossplay" },
];

const userSeeds = [
  {
    id: "user-pixelpulse",
    username: "pixelpulse",
    displayName: "PixelPulse",
    email: "pixelpulse@example.com",
  },
  {
    id: "user-slayerx",
    username: "slayerx",
    displayName: "SlayerX",
    email: null,
  },
];

function createInitialState() {
  const platforms = [...platformSeeds];
  const users = [...userSeeds];
  const usersByDisplayName = new Map(
    users.map((user) => [user.displayName.toLowerCase(), user]),
  );

  const ensureUser = (displayName) => {
    const key = displayName.toLowerCase();
    const existingUser = usersByDisplayName.get(key);

    if (existingUser) {
      return existingUser;
    }

    const user = {
      id: `user-${slugify(displayName)}`,
      username: slugify(displayName),
      displayName,
      email: null,
    };

    users.push(user);
    usersByDisplayName.set(key, user);
    return user;
  };

  const games = legacyGames.map((game) => ({
    id: `game-${game.id}`,
    legacyId: game.id,
    igdbId: null,
    title: game.title,
    slug: slugify(game.title),
    coverUrl: null,
    activePlayersLabel: game.active,
    followerCount: parseFollowerCount(game.followers),
    sessionCount: game.sessions,
    platforms: game.platforms
      .split(",")
      .map((platformName) => findPlatform(platforms, platformName.trim())),
  }));

  const gamesByLegacyId = new Map(
    games.map((game) => [String(game.legacyId), game]),
  );

  const sessions = legacySessions.map((session) => {
    const game = gamesByLegacyId.get(String(session.gameId));
    const host = ensureUser(session.host);
    const maxPlayers = Number(session.players.split("/")[1]?.trim() ?? 4);
    const joinedCount = Number(session.players.split("/")[0]?.trim() ?? 1);

    return {
      id: `session-${session.id}`,
      legacyId: session.id,
      gameId: game.id,
      platformId: findPlatform(platforms, session.platform).id,
      hostUserId: host.id,
      title: session.title,
      description: session.description,
      requirements: session.requirements,
      sessionType: session.tone,
      status: "open",
      scheduledAt: null,
      timeLabel: session.time,
      maxPlayers,
      members: buildMembers({ host, joinedCount, users }),
      chatMessages: session.chat.map((message, index) => ({
        id: `message-${session.id}-${index + 1}`,
        userId: ensureUser(message.author).id,
        message: message.message,
        timeLabel: message.time,
        createdAt: null,
      })),
    };
  });

  const gameFollows = [
    {
      id: "follow-pixelpulse-helldivers",
      userId: "user-pixelpulse",
      gameId: "game-1",
      notificationsEnabled: true,
    },
    {
      id: "follow-pixelpulse-lethal-company",
      userId: "user-pixelpulse",
      gameId: "game-2",
      notificationsEnabled: false,
    },
    {
      id: "follow-pixelpulse-monster-hunter-wilds",
      userId: "user-pixelpulse",
      gameId: "game-6",
      notificationsEnabled: true,
    },
  ];

  return {
    games,
    platforms,
    users,
    sessions,
    gameFollows,
  };
}

export const mockStore = createInitialState();

export function hydrateGame(game) {
  return {
    ...game,
    detailSessions: mockStore.sessions
      .filter((session) => session.gameId === game.id)
      .map(hydrateSession),
  };
}

export function hydrateSession(session) {
  const game = mockStore.games.find((candidate) => candidate.id === session.gameId);
  const platform = mockStore.platforms.find(
    (candidate) => candidate.id === session.platformId,
  );
  const host = mockStore.users.find(
    (candidate) => candidate.id === session.hostUserId,
  );

  return {
    ...session,
    game,
    platform,
    host,
    members: session.members.map((member) => ({
      ...member,
      user: mockStore.users.find((candidate) => candidate.id === member.userId),
    })),
    chatMessages: session.chatMessages.map((message) => ({
      ...message,
      user: mockStore.users.find((candidate) => candidate.id === message.userId),
    })),
  };
}

export function findPlatformBySlug(slug) {
  return mockStore.platforms.find((platform) => platform.slug === slug);
}

export function findUserByDisplayName(displayName) {
  return mockStore.users.find(
    (user) => user.displayName.toLowerCase() === displayName.toLowerCase(),
  );
}

export function createMockUser(displayName) {
  const existingUser = findUserByDisplayName(displayName);

  if (existingUser) {
    return existingUser;
  }

  const user = {
    id: `user-${slugify(displayName)}-${Date.now()}`,
    username: `${slugify(displayName)}-${Date.now()}`,
    displayName,
    email: null,
  };

  mockStore.users.push(user);
  return user;
}

function buildMembers({ host, joinedCount, users }) {
  const members = [
    {
      id: `member-${host.id}-host`,
      userId: host.id,
      role: MEMBER_ROLES.host,
      status: MEMBER_STATUSES.joined,
      joinedAt: null,
    },
  ];

  const additionalJoinedUsers = users
    .filter((user) => user.id !== host.id)
    .slice(0, Math.max(joinedCount - 1, 0));

  for (const user of additionalJoinedUsers) {
    members.push({
      id: `member-${host.id}-${user.id}`,
      userId: user.id,
      role: MEMBER_ROLES.member,
      status: MEMBER_STATUSES.joined,
      joinedAt: null,
    });
  }

  return members;
}

function findPlatform(platforms, platformName) {
  const normalizedName = platformName.toLowerCase();

  return (
    platforms.find(
      (platform) =>
        platform.name.toLowerCase() === normalizedName ||
        platform.slug === normalizedName,
    ) ?? platforms[0]
  );
}

function parseFollowerCount(value) {
  if (value.endsWith("k")) {
    return Math.round(Number(value.replace("k", "")) * 1000);
  }

  return Number(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
