import { createHttpError } from "../errors/http-error.js";

export function notFoundHandler(req, res, next) {
  next(createHttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
