import { Router } from "express";

import { igdbController } from "../controllers/igdb-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const igdbRouter = Router();

igdbRouter.get("/search", asyncHandler(igdbController.searchGames));
