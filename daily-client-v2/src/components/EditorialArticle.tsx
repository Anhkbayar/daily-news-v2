interface EditorialArticleProps {
  summary: string;
}

export function EditorialArticle({ summary }: EditorialArticleProps) {
  return (
    <article className="editorial-article">
      <h2 className="editorial-h1">Today's Digest</h2>
      <p className="editorial-body">{summary}</p>
    </article>
  );
}
