import { Article } from "../../types";
import { News } from "./Interface";
import { registerNewsProvider } from "./NewsFactory";

export class EguurNews implements News {
    feedUrl = "https://eguur.mn/wp-json/wp/v2/posts?per_page=30";
    sourceName = "eguurmn";

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
                const link = post?.link;

                if (!title || !link) {
                    continue;
                }
                const dateStr = post?.date_gmt || post?.date;
                if (!dateStr) {
                    continue;
                }
                const pubDate = new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);

                if (pubDate < twentyFourHoursAgo || pubDate > now) {
                    continue;
                }
                let rawDescription = "";
                try {
                    const pageResponse = await fetch(link, {
                        headers: { "User-Agent": "Mongolia-daily-flash-2.0" },
                        signal: AbortSignal.timeout(5000),
                    });

                    if (pageResponse.ok) {
                        await new HTMLRewriter()
                            .on('meta[property="og:description"]', {
                                element(element) {
                                    const content = element.getAttribute("content");
                                    if (content) rawDescription = content;
                                }
                            })
                            .on('meta[name="description"]', {
                                element(element) {
                                    const content = element.getAttribute("content");
                                    if (content && !rawDescription) rawDescription = content;
                                }
                            })
                            .transform(pageResponse)
                            .text();
                    } else {
                        console.log(`[${this.sourceName}] Page fetch failed with status ${pageResponse.status} for ${link}`);
                    }
                } catch (e) {
                    console.error(`[${this.sourceName}] Error scraping description from ${link}:`, e);
                }

                const cleanDescription = String(rawDescription || "No description provided.")
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

                allArticles.push({
                    title: String(title).replace(/<[^>]*>/g, "").trim(),
                    link: String(link).trim(),
                    description: cleanDescription,
                    pubDate,
                    source: this.sourceName,
                });
                sourceCount++;
            }

            console.log(`[${this.sourceName}] Ingested ${sourceCount} articles from last 24 hours`);
        } catch (error) {
            console.error(`Error [${this.sourceName}]: ${error}`);
        }

        return allArticles;
    }
}

registerNewsProvider('eguurmn', EguurNews);
