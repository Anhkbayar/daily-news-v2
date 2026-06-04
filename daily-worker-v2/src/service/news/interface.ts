import { Article } from "../../types";

export interface News {
    feedUrl: string;
    sourceName: string,
    ingest(): Promise<Article[]>;
}