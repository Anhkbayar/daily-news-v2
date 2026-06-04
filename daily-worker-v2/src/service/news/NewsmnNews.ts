import { Article } from "../../types";
import { News } from "./Interface";
import { registerNewsProvider } from "./NewsFactory";
import { parseRelativeTime } from "../TimeConverter";

export class NewsmnNews implements News {
    feedUrl = "https://news.mn/wp-json/wp/v2/posts?per_page=30&_embed";
    sourceName = "newsmn";

    async ingest(): Promise<Article[]> {
        console.log(`Ingesting from ${this.sourceName}`);
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        let allArticles: Article[] = [];

        try {
            const response = await fetch(this.feedUrl, {
                headers: { "User-Agent": "Mongolia-daily-flash-2.0" },
                signal: AbortSignal.timeout(8000),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const posts: any[] = await response.json();

            if (!Array.isArray(posts)) {
                console.log(`[${this.sourceName}] Unexpected response shape`);
                return allArticles;
            }

            console.log(`[${this.sourceName}] Received ${posts.length} posts from API`);

            let sourceCount = 0;

            for (const post of posts) {
                const title = post?.title?.rendered;
                const link = post?.id ? `https://news.mn/r/${post.id}` : null;

                const rawDescription = post?.excerpt?.rendered || post?.content?.rendered || "";

                let pubDate: Date | null = null;
                if (post?.current_time) {
                    pubDate = parseRelativeTime(post.current_time);
                }

                if (!pubDate) {
                    console.log(`[${this.sourceName}] Could not parse date for: ${title?.substring(0, 30)}`);
                    continue;
                }

                if (!title || !link) {
                    console.log(`[${this.sourceName}] Skipping post - missing title or link`);
                    continue;
                }

                const cleanDescription = String(rawDescription)
                    .replace(/<!\[CDATA\[|\]\]>/g, "")
                    .replace(/<[^>]*>/g, "")       // strip HTML tags
                    .replace(/&nbsp;/g, " ")        // decode common HTML entities
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&#8220;/g, '"')       // decode smart quotes
                    .replace(/&#8221;/g, '"')
                    .replace(/&#8216;/g, "'")
                    .replace(/&#8217;/g, "'")
                    .replace(/&#8230;/g, "...")
                    .replace(/\s+/g, " ")
                    .trim();

                if (pubDate >= twentyFourHoursAgo && pubDate <= now) {
                    allArticles.push({
                        title: String(title).replace(/<[^>]*>/g, "").trim(),
                        link: String(link).trim(),
                        description: cleanDescription || "No description provided.",
                        pubDate,
                        source: this.sourceName,
                    });
                    sourceCount++;
                } else {
                    console.log(`[${this.sourceName}] Skipping old article: ${title?.substring(0, 30)} - ${pubDate.toISOString()}`);
                }
            }

            console.log(`[${this.sourceName}] ingested ${sourceCount} articles from last 24 hours`);
        } catch (error) {
            console.error(`Error [${this.sourceName}]: ${error}`);
        }

        return allArticles;
    }
}

registerNewsProvider('newsmn', NewsmnNews);