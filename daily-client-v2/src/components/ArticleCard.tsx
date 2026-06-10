import type { Story } from '../types';

interface ArticleCardProps {
  story: Story;
}

// Strip HTML tags from description
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&ldquo;|&rdquo;/g, '"').trim();
}

export function ArticleCard({ story }: ArticleCardProps) {
  const plainSummary = stripHtml(story.summary);
  const excerpt = plainSummary.length > 220 ? plainSummary.slice(0, 220) + '…' : plainSummary;

  const handleCardClick = () => {
    if (story.sources && story.sources.length > 0) {
      window.open(story.sources[0].link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="cluster-card"
      style={{ textDecoration: 'none' }}
    >
      <div>
        <div className="cluster-header">
          <h4 className="cluster-title">{story.title}</h4>
        </div>
        <p className="cluster-synthesis">{excerpt}</p>
      </div>
      <div className="cluster-footer" onClick={(e) => e.stopPropagation()}>
        <span className="consolidation-meter">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          Sources:
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {story.sources.map((src, index) => (
            <a
              key={index}
              href={src.link}
              target="_blank"
              rel="noopener noreferrer"
              className="source-badge"
              style={{ textTransform: 'capitalize' }}
            >
              {src.portal}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
