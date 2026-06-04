import { Article } from "../types";
import { News } from "./interface";
import { registerNewsProvider } from "./newsFactory";

export class NewsmnNews implements News {
    feedUrl = "https://news.mn/feed";

    async ingest(): Promise<Article[]> {
        console.log("Ingesting from Newsmn");

        return [
            {
                title: 'Newsmn test',
                link: 'https://news.mn/r/236584',
                description: 'test',
                pubDate: new Date(),
                source: 'newsmn'
            }
        ];
    }
}

registerNewsProvider('newsmn', NewsmnNews);