import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type TwitchToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type IgdbGame = {
  id: number;
  name: string;
  slug?: string;
  cover?: {
    image_id?: string;
  };
  first_release_date?: number;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
};

let cachedToken:
  | {
    accessToken: string;
    expiresAt: number;
  }
  | null = null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse(
      { error: { message: "Method not allowed." } },
      { status: 405 },
    );
  }

  try {
    const query = await getSearchQuery(req);

    if (!query || query.length < 2) {
      return jsonResponse(
        { error: { message: "Search query must be at least 2 characters." } },
        { status: 400 },
      );
    }

    const games = await searchIgdbGames(query);

    return jsonResponse({ data: games });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "IGDB request failed.";

    return jsonResponse({ error: { message } }, { status: 500 });
  }
});

async function getSearchQuery(req: Request) {
  if (req.method === "GET") {
    return new URL(req.url).searchParams.get("q")?.trim() ?? "";
  }

  const body = await req.json().catch(() => ({}));
  return typeof body.query === "string" ? body.query.trim() : "";
}

async function searchIgdbGames(query: string) {
  const clientId = getRequiredEnv("TWITCH_CLIENT_ID");
  const accessToken = await getTwitchAccessToken();
  const apiBaseUrl = Deno.env.get("IGDB_API_BASE_URL") ??
    "https://api.igdb.com/v4";
  const escapedQuery = query.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const response = await fetch(`${apiBaseUrl}/games`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body: [
      "fields id,name,slug,cover.image_id,first_release_date,platforms.name;",
      `search "${escapedQuery}";`,
      "where version_parent = null;",
      "limit 10;",
    ].join(" "),
  });

  if (!response.ok) {
    throw new Error(`IGDB returned ${response.status}.`);
  }

  const games = await response.json() as IgdbGame[];
  return games.map((game) => ({
    igdbId: game.id,
    title: game.name,
    slug: game.slug ?? null,
    coverUrl: game.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,
    firstReleaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString()
      : null,
    platforms: game.platforms?.map((platform) => platform.name) ?? [],
  }));
}

async function getTwitchAccessToken() {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken;
  }

  const clientId = getRequiredEnv("TWITCH_CLIENT_ID");
  const clientSecret = getRequiredEnv("TWITCH_CLIENT_SECRET");
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Twitch token request returned ${response.status}.`);
  }

  const token = await response.json() as TwitchToken;
  cachedToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
