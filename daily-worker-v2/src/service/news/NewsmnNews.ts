import { Article } from "../../types";
import { News } from "./interface";
import { registerNewsProvider } from "./newsFactory";

export class NewsmnNews implements News {
    feedUrl = "https://news.mn/feed";
    sourceName = "newsmn";

    async ingest(): Promise<Article[]> {
        console.log(`Ingesting from ${this.sourceName}`);

        return [
            {
                title: 'Newsmn test',
                link: 'https://news.mn/r/236584',
                description: 'test',
                pubDate: new Date(),
                source: this.sourceName
            }
        ];
    }
}

registerNewsProvider('newsmn', NewsmnNews);