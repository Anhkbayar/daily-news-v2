import { Hono } from "hono";
import { createNewsProvider, getRegisteredSources } from "./service/news/newsFactory";
import "./service/news/iKonNews";
import "./service/news/NewsmnNews";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

app.get("/ingest", async (c) => {
  try {
    const sources = getRegisteredSources();

    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          const provider = createNewsProvider(source);
          const articles = await provider.ingest();
          return { source, success: true, count: articles.length, data: articles };
        } catch (error: any) {
          return { source, success: false, error: error.message };
        }
      })
    );

    return c.json({ success: true, data: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
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


export default app;
