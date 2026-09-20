import { requireUser } from "../middleware/current-user.js";
import { avatarMaxBytes, avatarMimeTypes } from "../storage/avatars-storage.js";
import { Router, raw } from "express";

import { usersController } from "../controllers/users-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const usersRouter = Router();

usersRouter.get("/me", asyncHandler(usersController.getCurrentUser));
usersRouter.get("/me/dashboard", asyncHandler(usersController.getDashboard));

usersRouter.put("/me/avatar", requireUser,
  raw({ type: avatarMimeTypes, limit: avatarMaxBytes, inflate: false }),
  asyncHandler(usersController.updateAvatar),
);
