import { Router } from "express";

import { gamesController } from "../controllers/games-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const gamesRouter = Router();

gamesRouter.get("/", asyncHandler(gamesController.listGames));
gamesRouter.post("/index", asyncHandler(gamesController.indexIgdbGame));
gamesRouter.get("/:gameId", asyncHandler(gamesController.getGame));
