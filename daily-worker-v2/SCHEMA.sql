DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS summary;
DROP TABLE IF EXISTS groups;

CREATE TABLE IF NOT EXISTS summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary TEXT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    link TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    pub_date TEXT NOT NULL,
    source TEXT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    summary_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (summary_id) REFERENCES summary(id)
);

CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, -- optional: AI-generated topic title
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_articles (
    group_id INTEGER NOT NULL,
    article_link TEXT NOT NULL,

    PRIMARY KEY (group_id, article_link),

    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (article_link) REFERENCES articles(link)
);