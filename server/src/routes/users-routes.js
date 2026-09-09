import { Router } from "express";

import { usersController } from "../controllers/users-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const usersRouter = Router();

usersRouter.get("/me", asyncHandler(usersController.getCurrentUser));
usersRouter.get("/me/dashboard", asyncHandler(usersController.getDashboard));
