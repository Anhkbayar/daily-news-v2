import type { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArticlesListProps {
  articles: Article[];
}

export function ArticlesList({ articles }: ArticlesListProps) {
  return (
    <>
      <div className="section-divider">
        <div className="section-divider-line" />
        <h3 className="section-divider-title">Today's highlight</h3>
        <div className="section-divider-line" />
      </div>

      <section className="clusters-grid">
        {articles.map((article, index) => (
          <ArticleCard key={`${article.link}-${index}`} article={article} />
        ))}
      </section>
    </>
  );
}
