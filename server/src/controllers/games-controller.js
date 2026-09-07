import { gamesService } from "../services/games-service.js";

export const gamesController = {
  listGames(req, res) {
    res.json({
      data: gamesService.listGames(req.query),
    });
  },

  getGame(req, res) {
    res.json({
      data: gamesService.getGame(req.params.gameId),
    });
  },
};
