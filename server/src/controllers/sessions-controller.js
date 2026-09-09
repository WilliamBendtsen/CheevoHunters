import { sessionsService } from "../services/sessions-service.js";

export const sessionsController = {
  async listSessions(req, res) {
    res.json({
      data: await sessionsService.listSessions(req.query),
    });
  },

  async getSession(req, res) {
    res.json({
      data: await sessionsService.getSession(req.params.sessionId),
    });
  },

  async createSession(req, res) {
    const session = await sessionsService.createSession({
      ...req.body,
      host: req.user?.displayName,
    });

    res.status(201).json({
      data: session,
    });
  },
};
