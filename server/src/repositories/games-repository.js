import { hydrateGame, mockStore } from "../data/mock-store.js";
import { serializeGame } from "../serializers/game-serializer.js";

function matchesGameId(game, gameId) {
  return String(game.id) === String(gameId) || String(game.legacyId) === String(gameId);
}

export const gamesRepository = {
  findAll() {
    return mockStore.games.map((game) => serializeGame(hydrateGame(game)));
  },

  findById(gameId) {
    const game = mockStore.games.find((candidate) => matchesGameId(candidate, gameId));
    return game ? serializeGame(hydrateGame(game)) : undefined;
  },

  findRecordById(gameId) {
    return mockStore.games.find((candidate) => matchesGameId(candidate, gameId));
  },
};
