import { Router } from "express";
import { authService, sessionDuration } from "../services/auth-service.js";
import { cookieName, sessionToken } from "../middleware/current-user.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { createHttpError } from "../errors/http-error.js";

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" };

// Bound memory and password-hashing work for this single-process server.
export function authRateLimit() {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    const key = req.ip;
    const entry = attempts.get(key) ?? { count: 0, until: now + 15 * 60 * 1000 };
    if (entry.count >= 10 || (!attempts.has(key) && attempts.size >= 10000)) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((entry.until - now) / 1000))));
      return next(createHttpError(429, "Too many attempts. Please try again later."));
    }
    entry.count++;
    attempts.set(key, entry);
    next();
  };
}

export const authRouter = Router();
const limit = authRateLimit();
for (const action of ["signup", "login"]) {
  authRouter.post(`/${action}`, limit, asyncHandler(async (req, res) => {
    const user = await authService[action](req.body);
    const token = await authService.createSession(user.id, sessionToken(req));
    res.cookie(cookieName, token, { ...cookieOptions, maxAge: sessionDuration });
    res.status(action === "signup" ? 201 : 200).json({ data: user });
  }));
}
authRouter.post("/logout", asyncHandler(async (req, res) => {
  await authService.logout(sessionToken(req));
  res.clearCookie(cookieName, cookieOptions);
  res.json({ data: null });
}));
