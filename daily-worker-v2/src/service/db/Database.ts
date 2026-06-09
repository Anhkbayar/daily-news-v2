import { getLinksByRanked } from "./Links";
import { getRankedByRun } from "./Ranked";
import { getLatestRun } from "./Runs";

export const saveToDatabaseHybrid = async (
    db: D1Database,
    summary: string,
    rankingResults: any
) => {

    const runResult = await db.prepare(
        `INSERT INTO digest_run (created_at) VALUES (datetime('now')) RETURNING id`
    ).first<{ id: number }>();
    const runId = runResult!.id;

    await db.prepare(`INSERT INTO top_summary (run_id, summary) VALUES (?, ?)`)
        .bind(runId, summary)
        .run();

    for (const story of rankingResults.stories) {
        const rankedResult = await db.prepare(
            `INSERT INTO ranked (run_id, rank, title, summary) VALUES (?, ?, ?, ?) RETURNING id`
        ).bind(runId, story.rank, story.title, story.summary || null).first<{ id: number }>();

        if (story.sources) {
            const linkQueries = story.sources.map((source: any) =>
                db.prepare(`INSERT INTO links (run_id, ranked_id, link, portal) VALUES (?, ?, ?, ?)`)
                    .bind(runId, rankedResult!.id, source.url, source.portal || "unknown")
            );

            if (linkQueries.length > 0) {
                await db.batch(linkQueries);
            }
        }
    }

    return { runId };
};

export const getLatestIngest = async (db: D1Database) => {
    const run = await getLatestRun(db);
    if (!run) return null;

    const stories = await getRankedByRun(db, run.run_id);

    const storiesWithLink = await Promise.all(
        stories.results.map(async (story: any) => {
            const links = await getLinksByRanked(db, story.id);
            return { ...story, sources: links.results };
        })
    )

    return { ...run, stories: storiesWithLink }
}