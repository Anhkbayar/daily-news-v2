import { Article } from "../types";
import { News } from "./interface";
import { registerNewsProvider } from "./newsFactory";

export class NewsmnNews implements News {
    feedUrl = "https://news.mn/feed";

    async ingest(): Promise<Article[]> {
        console.log("Ingesting from Newsmn");

        return [];
    }
}

registerNewsProvider('newsmn', NewsmnNews);