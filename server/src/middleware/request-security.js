import { env } from "../config/env.js";
import { createHttpError } from "../errors/http-error.js";

export function requestSecurity(req, res, next) {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Browser cookie mutations must originate from the configured frontend.
    if (req.headers.origin !== env.clientOrigin || !req.is("application/json")) {
      return next(createHttpError(403, "Request origin or content type is not allowed."));
    }
  }
  next();
}
