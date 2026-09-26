import { requireUser } from "../middleware/current-user.js";
import { Router } from "express";

import { sessionsController } from "../controllers/sessions-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateCreateSession } from "../validators/sessions-validator.js";

export const sessionsRouter = Router();

sessionsRouter.get("/", asyncHandler(sessionsController.listSessions));
sessionsRouter.post(
  "/",
  requireUser,
  validateCreateSession,
  asyncHandler(sessionsController.createSession),
);
sessionsRouter.get("/:sessionId", asyncHandler(sessionsController.getSession));

sessionsRouter.post(
  "/:sessionId/messages",
  requireUser,
  asyncHandler(sessionsController.sendMessage),
);
