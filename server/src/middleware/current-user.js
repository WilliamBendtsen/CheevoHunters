import { authService } from "../services/auth-service.js";
import { createHttpError } from "../errors/http-error.js";

export const cookieName = process.env.NODE_ENV === "production" ? "__Host-cheevo_session" : "cheevo_session";
export function sessionToken(req) {
  return req.headers.cookie?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}

export async function currentUser(req, res, next) {
  try {
    req.user = await authService.findUser(sessionToken(req));
    next();
  } catch (error) { next(error); }
}

export function requireUser(req, res, next) {
  if (!req.user) return next(createHttpError(401, "You must be signed in."));
  next();
}
