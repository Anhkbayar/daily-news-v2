import { Article } from "../types";
import { News } from "./interface";
import { registerNewsProvider } from "./newsFactory";

export class IkonNews implements News {
    feedUrl = "http://ikon.mn/rss";

    async ingest(): Promise<Article[]> {
        console.log("Ingesting from Ikon");

        return [
            {
                title: 'Ikon test',
                link: 'https://ikon.mn/a/236584',
                description: 'test',
                pubDate: new Date(),
                source: 'ikon'
            }
        ];
    }
}

registerNewsProvider('ikonmn', IkonNews);