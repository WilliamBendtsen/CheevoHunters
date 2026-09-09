import { usersService } from "../services/users-service.js";

export const usersController = {
  async getCurrentUser(req, res) {
    res.json({
      data: await usersService.getCurrentUser(req.user),
    });
  },

  async getDashboard(req, res) {
    res.json({
      data: await usersService.getDashboard(req.user),
    });
  },
};
