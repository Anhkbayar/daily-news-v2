CREATE TABLE IF NOT EXISTS summary (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    summary     TEXT    NOT NULL,                  
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS articles (
    link        TEXT    PRIMARY KEY,
    title       TEXT    NOT NULL,
    description TEXT,
    pub_date    TEXT    NOT NULL,
    source      TEXT    NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    summary_id  INTEGER NOT NULL REFERENCES summary(id) ON DELETE CASCADE,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_articles_summary_id ON articles (summary_id);
CREATE INDEX IF NOT EXISTS idx_articles_pub_date   ON articles (pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source     ON articles (source);


CREATE TABLE IF NOT EXISTS groups (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS group_articles (
    group_id     INTEGER NOT NULL REFERENCES groups(id)    ON DELETE CASCADE,
    article_link TEXT    NOT NULL REFERENCES articles(link) ON DELETE CASCADE,
    PRIMARY KEY (group_id, article_link)
);

CREATE INDEX IF NOT EXISTS idx_group_articles_link ON group_articles (article_link);


CREATE TABLE IF NOT EXISTS group_summary (
    group_id   INTEGER PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
    summary    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);