import { gamesService } from "../services/games-service.js";

export const gamesController = {
  async listGames(req, res) {
    res.json({
      data: await gamesService.listGames(req.query),
    });
  },

  async getGame(req, res) {
    res.json({
      data: await gamesService.getGame(req.params.gameId),
    });
  },
};
