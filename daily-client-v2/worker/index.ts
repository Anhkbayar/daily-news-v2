export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/feed")) {
      return env.Client.fetch("http://internal/datas");
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;