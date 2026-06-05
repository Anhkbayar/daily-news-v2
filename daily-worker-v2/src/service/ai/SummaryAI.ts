import { Article } from "../../types";

export async function generateSummary(
  articles: Article[],
  deepseekApiKey: string,
): Promise<string> {
  if (articles.length === 0) {
    return "No articles available for summary.";
  }

  const articleDigest = articles
    .map((article, i) => `[${i + 1}] ${article.title}`)
    .join("\n");

  const prompt = `You are a professional news editor for a Mongolian daily news digest called "Mongolia Daily Flash".
Below are today's news article titles and descriptions. Write a concise, engaging summary that a reader can finish in approximately 2 minutes (roughly 300-400 words).

Rules:
- Write in clear, professional English
- Group related topics together naturally
- Highlight the most important stories first
- Do NOT use bullet points or numbered lists — write in flowing paragraphs
- Do NOT include article numbers or source attributions in the summary
- End with a brief closing line

---
${articleDigest}
---

Write the 2-minute read summary now in mongolian:`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional news summarizer.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.4,
      }),
    });

    if (response && typeof response === "object" && "response" in response) {
      return (response as { response: string }).response.trim();
    }

    return "Summary generation failed — unexpected AI response format.";
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return `Summary could not be generated. ${articles.length} articles were collected.`;
  }
}
