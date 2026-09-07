import { usersRepository } from "../repositories/users-repository.js";

export function currentUser(req, res, next) {
  req.user = usersRepository.findMockCurrentUser();
  next();
}
