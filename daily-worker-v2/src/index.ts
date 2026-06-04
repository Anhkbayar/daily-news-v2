import { Hono } from "hono";
import { createNewsProvider } from "./news/newsFactory";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Hello Hono!");
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
