export const NewsStoriesSchema = {
  type: "object",
  properties: {
    stories: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          rank: {
            type: "integer",
            minimum: 1,
          },
          category: { type: "string" },
          headline: { type: "string" },
          summary: { type: "string" },
          sources: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                portal: { type: "string" },
                url: { type: "string", format: "uri" },
              },
              required: ["portal", "url"],
            },
          },
        },
        required: ["rank", "category", "headline", "summary", "sources"],
      },
    },
  },
  required: ["stories"],
};
