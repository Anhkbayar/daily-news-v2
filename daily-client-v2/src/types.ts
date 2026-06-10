export interface Source {
  link: string;
  portal: string;
}

export interface Story {
  id: number;
  rank: number;
  title: string;
  summary: string;
  sources: Source[];
}

export interface DailyFeed {
  data: {
    run_id: number;
    created_at: string;
    top_summary: string;
    stories: Story[];
  };
}
