import { sessionsService } from "../services/sessions-service.js";

export const sessionsController = {
  listSessions(req, res) {
    res.json({
      data: sessionsService.listSessions(req.query),
    });
  },

  getSession(req, res) {
    res.json({
      data: sessionsService.getSession(req.params.sessionId),
    });
  },

  createSession(req, res) {
    const session = sessionsService.createSession({
      ...req.body,
      host: req.user?.displayName,
    });

    res.status(201).json({
      data: session,
    });
  },
};
