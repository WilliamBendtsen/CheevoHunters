import {
  createMockUser,
  findPlatformBySlug,
  hydrateSession,
  mockStore,
} from "../data/mock-store.js";
import { toPlatformSlug } from "../models/platform-model.js";
import { MEMBER_ROLES, MEMBER_STATUSES } from "../models/session-model.js";
import { serializeSession } from "../serializers/session-serializer.js";

function matchesSessionId(session, sessionId) {
  return (
    String(session.id) === String(sessionId) ||
    String(session.legacyId) === String(sessionId)
  );
}

export const sessionsRepository = {
  findAll() {
    return mockStore.sessions.map((session) => serializeSession(hydrateSession(session)));
  },

  findById(sessionId) {
    const session = mockStore.sessions.find((candidate) =>
      matchesSessionId(candidate, sessionId),
    );

    return session ? serializeSession(hydrateSession(session)) : undefined;
  },

  create(session) {
    const host = createMockUser(session.host);
    const platform = findPlatformBySlug(toPlatformSlug(session.platform));
    const sessionRecord = {
      id: session.id,
      legacyId: session.id,
      gameId: session.gameId,
      platformId: platform.id,
      hostUserId: host.id,
      title: session.title,
      description: session.description,
      requirements: session.requirements,
      sessionType: session.sessionType,
      status: "open",
      scheduledAt: null,
      timeLabel: session.time,
      maxPlayers: session.maxPlayers,
      members: [
        {
          id: `member-${session.id}-${host.id}`,
          userId: host.id,
          role: MEMBER_ROLES.host,
          status: MEMBER_STATUSES.joined,
          joinedAt: null,
        },
      ],
      chatMessages: [],
    };

    mockStore.sessions.push(sessionRecord);
    return serializeSession(hydrateSession(sessionRecord));
  },
};
