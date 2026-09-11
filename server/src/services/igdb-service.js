import { env } from "../config/env.js";
import { createHttpError } from "../errors/http-error.js";

const IGDB_SEARCH_FUNCTION = "igdb-search";

export const igdbService = {
  async searchGames(query) {
    const searchQuery = typeof query === "string" ? query.trim() : "";

    if (searchQuery.length < 2) {
      throw createHttpError(400, "Search query must be at least 2 characters.");
    }

    if (!env.supabase.url || !env.supabase.anonKey) {
      throw createHttpError(503, "Supabase function proxy is not configured.");
    }

    const response = await fetch(
      `${env.supabase.url}/functions/v1/${IGDB_SEARCH_FUNCTION}?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          apikey: env.supabase.anonKey,
          Authorization: `Bearer ${env.supabase.anonKey}`,
        },
      },
    );
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw createHttpError(
        502,
        body.error?.message ?? `IGDB proxy returned ${response.status}.`,
      );
    }

    return body.data ?? [];
  },
};
