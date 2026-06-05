import {
  DescriptionRemovedArticle,
  Source,
  Ranked,
  StoriesResponse,
} from "../../types";
import { NewsStoriesSchema } from "./OutputSchema";

export async function groupArticles(
  articles: DescriptionRemovedArticle[],
  ai: Ai,
): Promise<StoriesResponse> {
  if (articles.length === 0) {
    return { stories: [] };
  }

  const articleDigest = articles
    .map((article, i) => `[${i + 1}] ${article.title}`)
    .join("\n");

  const prompt = `You are a professional Mongolian news editor. Analyze the daily articles provided below.
Your task:
1. Cluster/Group related articles reporting on the same event or topic (Semantic Grouping).
2. Rank the top 5 most important stories from 1 to 5 based on their editorial/national importance.
3. For each ranked story, write:
   - A unified, highly engaging headline in Mongolian.
   - A clear, exactly 2-sentence summary/breakdown in Mongolian.
   - The array of sources that contributed to this story. Carefully map the "Source Portal" to "portal" and the "URL" to "url" from the articles grouped into this story.

Articles to process:
${articleDigest}`;

  try {
    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content:
            "You are an analytical news editor. Group related news stories together, assess their trend volume/heat, select the top 5, and rank them based strictly on how heavily trending they are..",
        },
        { role: "user", content: prompt },
      ],

      response_format: {
        type: "json_schema",
        schema: NewsStoriesSchema,
      },
      max_tokens: 2000,
    });

    if (response && typeof response === "object") {
      let rawResults: any = response;
      if ("response" in rawResults) {
        rawResults = response.response;
      }

      if (typeof rawResults === "string") {
        const cleanedText = rawResults.replace(/^```json\s*|```$/g, "").trim();
        return JSON.parse(cleanedText) as StoriesResponse;
      }

      return rawResults as StoriesResponse;
    }
    throw new Error("Ai return invalid format");
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return { stories: [] };
  }
}
