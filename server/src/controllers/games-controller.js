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

  async indexIgdbGame(req, res) {
    res.status(201).json({
      data: await gamesService.indexIgdbGame(req.body),
    });
  },
};
