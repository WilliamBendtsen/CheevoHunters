import { requestSecurity } from "./middleware/request-security.js";
import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { currentUser } from "./middleware/current-user.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found-handler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(requestSecurity);
  app.use(express.json({ limit: "16kb" }));
  app.use(currentUser);

  app.get("/", (req, res) => {
    res.json({
      name: "CheevoHunters API",
      status: "ok",
      docs: "/api/health",
    });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
