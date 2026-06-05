import { Article, DescriptionRemovedArticle } from "./types";

export const removeDescriptions = (
  articles: Article[],
): DescriptionRemovedArticle[] => {
  return articles.map((article) => ({
    title: article.title,
    link: article.link,
    pubDate: article.pubDate,
    source: article.source,
  }));
};
