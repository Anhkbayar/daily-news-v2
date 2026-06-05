import { Hono } from "hono";
import { groupArticles } from "./service/ai/SemanticGroup";
import { generateSummary } from "./service/ai/SummaryAI";
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
    console.log(results);

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
    const rankingResults = await groupArticles(removedDescriptions, env.AI);
    return new Response(
      JSON.stringify({ success: true, data: rankingResults }),
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
