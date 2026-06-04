import { Hono } from "hono";
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

const handleIngest = async () => {
  try {
    const results = await ingestAllSources();
    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { "Content-Type": "application/json" },
    });
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
  return handleIngest();
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

addEventListener("scheduled", (event) => {
  event.waitUntil(handleIngest());
});

export default app;
