import { createHttpError } from "../errors/http-error.js";

export const usersService = {
  getCurrentUser(user) {
    if (!user) {
      throw createHttpError(401, "You must be signed in.");
    }

    return user;
  },
};
