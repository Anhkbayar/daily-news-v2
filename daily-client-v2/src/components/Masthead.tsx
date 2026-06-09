import type { DailyFeed } from '../types';

interface MastheadProps {
  feed: DailyFeed | null;
}

function formatFeedDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function Masthead({ feed }: MastheadProps) {
  return (
    <header className="masthead-container">
      <h1 className="masthead-title">The Mongolia Daily Flash</h1>

      {feed && (
        <div className="masthead-meta">
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formatFeedDate(feed.date)}
          </span>
          <span className="meta-item">
            {feed.articles.length} articles
          </span>
        </div>
      )}
    </header>
  );
}
