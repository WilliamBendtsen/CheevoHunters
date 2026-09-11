import { igdbService } from "../services/igdb-service.js";

export const igdbController = {
  async searchGames(req, res) {
    res.json({
      data: await igdbService.searchGames(req.query.q),
    });
  },
};
