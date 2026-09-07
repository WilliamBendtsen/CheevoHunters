import { createHttpError } from "../errors/http-error.js";
import { PLATFORM_INPUT_MAP } from "../models/platform-model.js";
import { SESSION_TYPES } from "../models/session-model.js";

const requiredStringFields = ["gameId", "title", "platform", "sessionType", "description"];

export function validateCreateSession(req, res, next) {
  const errors = {};

  for (const field of requiredStringFields) {
    if (!isPresent(req.body[field])) {
      errors[field] = "This field is required.";
    }
  }

  const maxPlayers = Number(req.body.maxPlayers);
  if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 12) {
    errors.maxPlayers = "Choose a whole number between 2 and 12.";
  }

  if (isPresent(req.body.platform) && !PLATFORM_INPUT_MAP[req.body.platform]) {
    errors.platform = "Choose a supported platform.";
  }

  if (isPresent(req.body.sessionType) && !SESSION_TYPES[req.body.sessionType]) {
    errors.sessionType = "Choose a supported session type.";
  }

  if (Object.keys(errors).length > 0) {
    next(createHttpError(400, "Session validation failed.", errors));
    return;
  }

  next();
}

function isPresent(value) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}
