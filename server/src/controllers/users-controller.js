import { usersService } from "../services/users-service.js";

export const usersController = {
  getCurrentUser(req, res) {
    res.json({
      data: usersService.getCurrentUser(req.user),
    });
  },
};
