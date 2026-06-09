export interface Article {
  link: string;
  title: string;
  description: string;
  pub_date: string;
  source: string;
  status: number;
  summary_id: number;
  created_at: string;
}

export interface DailyFeed {
  summary: string;
  date: string;
  articles: Article[];
}
