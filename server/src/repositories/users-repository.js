import { mockStore } from "../data/mock-store.js";
import { serializeUser } from "../serializers/user-serializer.js";

export const usersRepository = {
  findMockCurrentUser() {
    const user = mockStore.users.find((candidate) => candidate.username === "pixelpulse");
    return user ? serializeUser(user) : undefined;
  },
};
