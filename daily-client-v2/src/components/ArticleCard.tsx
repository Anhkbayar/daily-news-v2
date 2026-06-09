import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

function formatPubDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Strip HTML tags from description
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&ldquo;|&rdquo;/g, '"').trim();
}

export function ArticleCard({ article }: ArticleCardProps) {
  const plainDescription = stripHtml(article.description);
  const excerpt = plainDescription.length > 220 ? plainDescription.slice(0, 220) + '…' : plainDescription;

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="cluster-card"
      style={{ textDecoration: 'none' }}
    >
      <div>
        <div className="cluster-header">
          <h4 className="cluster-title">{article.title}</h4>
        </div>
        <p className="cluster-synthesis">{excerpt}</p>
      </div>
      <div className="cluster-footer">
        <span className="consolidation-meter">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {article.source}
        </span>
        <span className="sources-count">{formatPubDate(article.pub_date)}</span>
      </div>
    </a>
  );
}
