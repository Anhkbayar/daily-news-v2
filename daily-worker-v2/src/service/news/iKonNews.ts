import { Article } from "../../types";
import { News } from "./interface";
import { registerNewsProvider } from "./newsFactory";
import { XMLParser } from "fast-xml-parser";

export class IkonNews implements News {
    feedUrl = "http://ikon.mn/rss";
    sourceName = "ikon";

    async ingest(): Promise<Article[]> {
        console.log(`Ingesting from ${this.sourceName}`);
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        let allArticles: Article[] = [];
        const parser = new XMLParser({ ignoreAttributes: false });

        try {
            const response = await fetch(this.feedUrl, {
                headers: { 'User-agent': 'Mongolia-daily-flash-2.0' },
                signal: AbortSignal.timeout(8000)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const xmlText = await response.text();
            const jsonObj = parser.parse(xmlText);
            const items = jsonObj?.rss?.channel?.item;

            if (!items) console.log('Suirel');

            const rawArticles = Array.isArray(items) ? items : [items];
            let sourceCount = 0;

            for (const item of rawArticles) {
                if (!item.title || !item.link) continue;

                const pubDate = item.pubDate ? new Date(item.pubDate) : null;

                const rawDescription = item.description || item.summary || "";

                const cleanDescription = String(rawDescription)
                    .replace(/<!\[CDATA\[|\]\]>/g, '') // Strip CDATA wrappers
                    .replace(/<[^>]*>/g, '')           // Strip raw HTML tags (e.g. <img>, <p>)
                    .replace(/\s+/g, ' ')              // Normalize spacing
                    .trim();

                if (pubDate && pubDate >= twentyFourHoursAgo && pubDate <= now) {
                    allArticles.push({
                        title: String(item.title).trim(),
                        link: String(item.link).trim(),
                        description: cleanDescription || 'No description provided.',
                        pubDate,
                        source: this.sourceName
                    })
                    sourceCount++;
                }
            }
        } catch (error) {
            console.log(`Aldaa [${this.sourceName}] due to error: ${error}`);
        }
        return allArticles;
    }
}

registerNewsProvider('ikonmn', IkonNews);