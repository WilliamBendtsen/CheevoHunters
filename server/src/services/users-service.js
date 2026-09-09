import { createHttpError } from "../errors/http-error.js";
import { usersRepository } from "../repositories/users-repository.js";

export const usersService = {
  async getCurrentUser(user) {
    if (!user) {
      throw createHttpError(401, "You must be signed in.");
    }

    return user;
  },

  async getDashboard(user) {
    if (!user) {
      throw createHttpError(401, "You must be signed in.");
    }

    return usersRepository.findDashboard(user.id);
  },
};
