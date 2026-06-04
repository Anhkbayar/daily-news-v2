import { Article } from "../types";

export interface News {
    feedUrl: string;
    ingest(): Promise<Article[]>;
}