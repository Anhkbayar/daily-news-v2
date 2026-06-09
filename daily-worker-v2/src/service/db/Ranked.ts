export const getRankedByRun = async (db: D1Database, runId: number) => {
    return await db.prepare(`
        SELECT id, rank, title, summary
        FROM ranked
        WHERE run_id = ?
        ORDER BY rank ASC
    `).bind(runId).all();
};