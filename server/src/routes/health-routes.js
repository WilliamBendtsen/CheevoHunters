import { Router } from "express";

import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json({
    data: {
      status: "ok",
      dataProvider: env.dataProvider,
      supabaseConfigured: Boolean(env.supabase.url && env.supabase.anonKey),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});
