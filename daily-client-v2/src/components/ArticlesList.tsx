import type { Story } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArticlesListProps {
  stories: Story[];
}

export function ArticlesList({ stories }: ArticlesListProps) {
  return (
    <>
      <div className="section-divider">
        <div className="section-divider-line" />
        <h3 className="section-divider-title">Today's highlight</h3>
        <div className="section-divider-line" />
      </div>

      <section className="clusters-grid">
        {stories.map((story) => (
          <ArticleCard key={story.id} story={story} />
        ))}
      </section>
    </>
  );
}
