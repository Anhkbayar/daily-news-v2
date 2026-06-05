export const NewsStoriesSchema = {
  type: "object",
  properties: {
    stories: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          rank: {
            type: "integer",
            minimum: 1,
          },
          title: { type: "string" },
          description: { type: "string" },
          matched_article_id: {
            type: "array",
            minItems: 1,
            items: {
              type: "integer",
            },
          },
        },
        required: ["rank", "title", "description", "matched_article_id"],
        additionalProperties: false,
      },
    },
  },
  required: ["stories"],
  additionalProperties: false,
};
