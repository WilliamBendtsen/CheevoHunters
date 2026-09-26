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

  async sendMessage(req, res) {
    res.status(201).json({
      data: await sessionsService.sendMessage(req.params.sessionId, req.user.id, req.body),
    });
  },

  async createSession(req, res) {
    const session = await sessionsService.createSession({
      ...req.body,
      hostUserId: req.user.id,
    });

    res.status(201).json({
      data: session,
    });
  },
};
