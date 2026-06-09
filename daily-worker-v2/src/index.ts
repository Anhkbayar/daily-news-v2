import { Hono } from "hono";
import { groupArticle } from "./service/ai/SemanticGroup";
import { generateSummary } from "./service/ai/SummaryAI";
import { getLatestIngest, saveToDatabaseHybrid } from "./service/db/Database";
import { removeDescriptions } from "./helpers";
import { Article } from "./types";
import {
  createNewsProvider,
  getRegisteredSources,
} from "./service/news/NewsFactory";
import "./service/news/iKonNews";
import "./service/news/NewsmnNews";
import "./service/news/EguurNews";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

const ingestAllSources = async () => {
  const sources = getRegisteredSources();

  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        const provider = createNewsProvider(source);
        const articles = await provider.ingest();
        return {
          source,
          success: true,
          count: articles.length,
          data: articles,
        };
      } catch (error: any) {
        return { source, success: false, error: error.message };
      }
    }),
  );

  return results;
};

const handleIngest = async (env: CloudflareBindings) => {
  try {
    const results = await ingestAllSources();

    const articles = results
      .filter(
        (
          result,
        ): result is {
          source: string;
          success: true;
          count: number;
          data: Article[];
        } => result.success === true && Array.isArray(result.data),
      )
      .flatMap((result) => result.data);

    const removedDescriptions = removeDescriptions(articles);
    const rankingResults = await groupArticle(removedDescriptions);
    const firstRanked = rankingResults.stories.find((s: { rank: number }) => s.rank === 1);

    let topStorySources = [];

    if (firstRanked) {
      const descriptionMap = new Map<string, string>(
        articles.map(article => [article.link, article.description])
      );

      topStorySources = firstRanked.sources.map((sourceObj: { url: string }) => ({
        link: sourceObj.url,
        description: descriptionMap.get(sourceObj.url) || "No Description found"
      }));
    }

    const firstRankedSummary = await generateSummary(topStorySources.map((source: any) => source.description));

    const savedResults = await saveToDatabaseHybrid(env.daily_news_db, firstRankedSummary, rankingResults);

    return new Response(
      JSON.stringify({ success: true, data: savedResults }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

app.get("/ingest", async (c) => {
  return handleIngest(c.env);
});

app.get("/ingest/:source", async (c) => {
  const source = c.req.param("source");

  try {
    const provider = createNewsProvider(source);
    const articles = await provider.ingest();

    return c.json({ success: true, source, data: articles });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/datas", async (c) => {
  try {
    const data = await getLatestIngest(c.env.daily_news_db);
    if (!data) return c.json({ data: null });
    return c.json({ data });
  } catch (e) {
    return c.json({ error: "Failed to fetch data" }, 500);
  }
})

export default {
  fetch: app.fetch,

  scheduled: async (
    event: ScheduledEvent,
    env: CloudflareBindings,
    ctx: ExecutionContext,
  ) => {
    ctx.waitUntil(handleIngest(env));
  },
};
