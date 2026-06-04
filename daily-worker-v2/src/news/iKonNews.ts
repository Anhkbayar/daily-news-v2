import { Article } from "../types";
import { News } from "./interface";
import { registerNewsProvider } from "./newsFactory";

export class IkonNews implements News {
    feedUrl = "http://ikon.mn/rss";

    async ingest(): Promise<Article[]> {
        console.log("Ingesting from Ikon");

        return [];
    }
}

registerNewsProvider('ikon', IkonNews);