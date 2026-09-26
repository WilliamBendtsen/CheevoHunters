import { toSessionTone, toSessionTypeLabel } from "../models/session-model.js";

export function serializeSession(session) {
  const joinedMembers = session.members.filter((member) => member.status === "joined");

  return {
    id: session.legacyId ?? session.id,
    type: toSessionTypeLabel(session.sessionType),
    tone: toSessionTone(session.sessionType),
    platform: session.platform.name,
    time: session.timeLabel,
    title: session.title,
    host: session.host.displayName,
    players: `${joinedMembers.length} / ${session.maxPlayers}`,
    gameId: session.game.legacyId ?? session.game.id,
    gameTitle: session.game.title,
    gameCoverUrl: session.game.coverUrl ?? null,
    description: session.description,
    requirements: session.requirements,
    chat: session.chatMessages.map((message) => ({
      id: message.id,
      user: { id: message.user.id, username: message.user.username, displayName: message.user.displayName, avatarUrl: message.user.avatarUrl },
      createdAt: message.createdAt,
      author: message.user.displayName,
      time: message.timeLabel,
      message: message.message,
    })),
    roster: buildRoster(session),
  };
}

function buildRoster(session) {
  const rows = session.members.map((member) => ({
    name: member.user.displayName,
    status: member.role === "host" ? "Joined" : statusLabel(member.status),
    joined: member.status === "joined",
  }));

  const openSlots = Math.max(session.maxPlayers - rows.length, 0);

  return [
    ...rows,
    ...Array.from({ length: openSlots }, () => ({
      name: "Open Slot",
      status: "Available",
      open: true,
    })),
  ];
}

function statusLabel(status) {
  const labels = {
    joined: "Joined",
    pending: "Pending approval",
    rejected: "Rejected",
    left: "Left",
  };

  return labels[status] ?? status;
}
