import { Router } from "express";

import { gamesRouter } from "./games-routes.js";
import { healthRouter } from "./health-routes.js";
import { sessionsRouter } from "./sessions-routes.js";
import { usersRouter } from "./users-routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/games", gamesRouter);
apiRouter.use("/sessions", sessionsRouter);
apiRouter.use("/users", usersRouter);
