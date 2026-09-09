import { usersRepository } from "../repositories/users-repository.js";

export async function currentUser(req, res, next) {
  try {
    req.user = await usersRepository.findMockCurrentUser();
    next();
  } catch (error) {
    next(error);
  }
}
