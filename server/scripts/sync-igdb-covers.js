import { db, closeDb } from "../src/db/client.js";
import { igdbService } from "../src/services/igdb-service.js";

const normalize = (value) => value.trim().toLowerCase();

function pickBestMatch(game, results) {
  const title = normalize(game.title);
  const slug = normalize(game.slug);
  const withCover = results.filter((result) => result.coverUrl);

  return (
    withCover.find((result) => normalize(result.title) === title) ??
    withCover.find((result) => result.slug && normalize(result.slug) === slug) ??
    withCover[0] ??
    null
  );
}

async function getGamesMissingCovers() {
  const { rows } = await db.query(`
    select id, title, slug, igdb_id, cover_url
    from games
    where cover_url is null or igdb_id is null
    order by title
  `);

  return rows;
}

async function updateGameCover(client, game, match) {
  await client.query(
    `
      update games
      set
        igdb_id = coalesce(igdb_id, $2),
        cover_url = $3,
        updated_at = now()
      where id = $1
    `,
    [game.id, match.igdbId, match.coverUrl],
  );
}

async function main() {
  const games = await getGamesMissingCovers();

  if (games.length === 0) {
    console.log("All games already have IGDB metadata.");
    return;
  }

  const updates = [];

  for (const game of games) {
    const results = await igdbService.searchGames(game.title);
    const match = pickBestMatch(game, results);

    if (!match) {
      throw new Error(`No IGDB cover found for ${game.title}. No rows were updated.`);
    }

    updates.push({ game, match });
  }

  const client = await db.connect();

  try {
    await client.query("begin");

    for (const { game, match } of updates) {
      await updateGameCover(client, game, match);
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  for (const { game, match } of updates) {
    console.log(`${game.title} -> ${match.title} (${match.coverUrl})`);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
