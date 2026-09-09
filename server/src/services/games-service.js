import { createHttpError } from "../errors/http-error.js";
import { gamesRepository } from "../repositories/games-repository.js";

export const gamesService = {
  async listGames(query = {}) {
    const search = query.search?.toLowerCase();
    const platform = query.platform?.toLowerCase();

    const games = await gamesRepository.findAll();

    return games.filter((game) => {
      const matchesSearch = search
        ? game.title.toLowerCase().includes(search)
        : true;
      const matchesPlatform = platform
        ? game.platforms.toLowerCase().includes(platform)
        : true;

      return matchesSearch && matchesPlatform;
    });
  },

  async getGame(gameId) {
    const game = await gamesRepository.findById(gameId);

    if (!game) {
      throw createHttpError(404, `Game not found: ${gameId}`);
    }

    return game;
  },
};
