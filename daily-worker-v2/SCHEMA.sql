CREATE TABLE IF NOT EXISTS digest_run (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS digest_article(
    link TEXT PRIMARY KEY,
    run_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL,
    pub_date DATETIME NOT NULL,
    FOREIGN KEY(run_id) REFERENCES digest_run(id)
);

