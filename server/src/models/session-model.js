export const SESSION_TYPES = {
  achievement: "Achievement Hunt",
  coop: "Co-op Session",
  competitive: "Competitive Grind",
  casual: "Casual Run",
};

export const SESSION_STATUSES = {
  open: "open",
  full: "full",
  inProgress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
};

export const MEMBER_ROLES = {
  host: "host",
  member: "member",
};

export const MEMBER_STATUSES = {
  joined: "joined",
  pending: "pending",
  rejected: "rejected",
  left: "left",
};

export function toSessionTone(sessionType) {
  return sessionType === "coop" ? "coop" : sessionType;
}

export function toSessionTypeLabel(sessionType) {
  return SESSION_TYPES[sessionType] ?? SESSION_TYPES.casual;
}
