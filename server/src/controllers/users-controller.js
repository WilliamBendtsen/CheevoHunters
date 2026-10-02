import { avatarService } from "../services/avatar-service.js";
import { usersService } from "../services/users-service.js";

export const usersController = {
  async updateAvatar(req, res) {
    res.json({ data: await avatarService.update(req.user.id, req.body) });
  },

  async searchUsers(req, res) {
    res.json({
      data: await usersService.searchUsers(req.user, req.query.q),
    });
  },

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
