export interface Article {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  source: string;
}

export interface DescriptionRemovedArticle {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
}

export interface Source {
  portal: string;
  url: string;
}

export interface Ranked {
  rank: number;
  category: string;
  headline: string;
  summary: string;
  sources: Source[];
}

export interface StoriesResponse {
  stories: Ranked[];
}
