import { createHash, randomUUID } from "node:crypto";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveGameId(input) {
  const value = String(input);
  return isUuid(value) ? value : createDeterministicUuid(`cheevohunters:game-${value}`);
}

export function resolveSessionId(input) {
  const value = String(input);
  return isUuid(value)
    ? value
    : createDeterministicUuid(`cheevohunters:session-${value}`);
}

export function createNewId() {
  return randomUUID();
}

export function toApiGameId(id) {
  return legacyGameIdsByUuid.get(id) ?? id;
}

export function toApiSessionId(id) {
  return legacySessionIdsByUuid.get(id) ?? id;
}

function isUuid(value) {
  return uuidPattern.test(value);
}

function createDeterministicUuid(value) {
  const bytes = createHash("sha1").update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

const legacyGameIdsByUuid = new Map(
  Array.from({ length: 6 }, (_, index) => {
    const legacyId = String(index + 1);
    return [resolveGameId(legacyId), Number(legacyId)];
  }),
);

const legacySessionIds = [
  "helldivers-all-guns-blazing",
  "helldivers-hardcore-campaign",
  "helldivers-trophy-cleanup",
  "helldivers-speedrun-achievement",
  "lethal-quota-push",
  "lethal-new-player-salvage",
  "lethal-high-risk-rotation",
  "elden-boss-help",
  "elden-armaments-cleanup",
  "elden-rune-farming",
  "deep-rock-elite-dive",
  "deep-rock-promotions",
  "deep-rock-mineral-hunt",
  "portal-professor",
  "portal-campaign-replay",
  "mhw-campaign",
  "mhw-rare-materials",
  "mhw-arena-challenges",
];

const legacySessionIdsByUuid = new Map(
  legacySessionIds.map((legacyId) => [resolveSessionId(legacyId), legacyId]),
);
