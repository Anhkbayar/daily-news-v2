export const getLatestRun = async (db: D1Database) => {
    return await db.prepare(`
        SELECT dr.id as run_id, dr.created_at, ts.summary as top_summary
        FROM digest_run dr
        LEFT JOIN top_summary ts ON ts.run_id = dr.id
        ORDER BY dr.created_at DESC
        LIMIT 1
    `).first<{ run_id: number; created_at: string; top_summary: string }>();
};