export const getLinksByRanked = async (db: D1Database, rankedId: number) => {
    return await db.prepare(`
        SELECT link, portal FROM links WHERE ranked_id = ?
    `).bind(rankedId).all();
};