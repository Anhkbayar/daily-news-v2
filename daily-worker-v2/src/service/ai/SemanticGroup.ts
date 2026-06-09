import {
  DescriptionRemovedArticle,
  StoriesResponse,
  Ranked,
  Source,
} from "../../types";
import { getDeepseek } from "./Deepseek";


interface AIGeneratedStory {
  rank: number;
  title: string;
  description: string;
  matched_article_id: number[];
}

interface AISchemaResponse {
  stories: AIGeneratedStory[];
}

export async function groupArticle(
  articles: DescriptionRemovedArticle[],
  env: { DEEPSEEK_API_KEY: string }
): Promise<any> {
  if (articles.length === 0) {
    return { stories: [] };
  }
  const deepseek = getDeepseek(env);

  const articleMap = new Map<number, DescriptionRemovedArticle>();
  const simplifiedArticles = articles.map((article, index) => {
    const id = index + 1;
    articleMap.set(id, article);
    return {
      id,
      title: article.title,
    };
  });

  const articlesJsonText = JSON.stringify(simplifiedArticles, null, 2);

  const prompt = `Үүрэг: Та бол Монголын өдөр тутмын мэдээллийн товхимол бэлтгэдэг мэргэжлийн AI редактор.
Өгөгдсөн нийтлэлүүдийг уншиж, утга санаагаар нь бүлэглэн (Semantic Grouping) хамгийн халуун, олон суваг зэрэг хөндөж буй (Trending) ТОП 1-ээс 5 хүртэлх сэдвийг сонгоно уу.

Эрэмбэлэх дүрэм:
1. Олон өөр портал дээр нэгэн зэрэг гарсан тренд мэдээг дээгүүр (Rank 1) эрэмбэлнэ.
2. Гарчиг болон товч агуулгыг цэвэр монгол хэлээр бичнэ.
3. Мэдээ бүрийн холбоосыг өөрөө зохиож БОЛОХГҮЙ. Зөвхөн уг мэдээнд хамаарах эх сурвалжийн "id"-г "matched_article_id" дотор цуглуулж өгнө үү.

Нийтлэлүүд:
${articlesJsonText}

Хариу өгөх заавал биелүүлэх JSON формат:
{
  "stories": [
    {
      "rank": 1,
      "title": "Нийтлэлийн гарчиг",
      "description": "Нийтлэлийн товч тайлбар",
      "matched_article_id": [1, 2]
    }
  ]
}`;

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-v4-flash",
      max_tokens: 8192,

      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content:
            "You are a specialized AI system designed to output data strictly in json format. Never output conversational elements, markdown formatting brackets, or text outside the raw object block.",
        },
        { role: "user", content: prompt },
      ],
    });

    let aiResult: AISchemaResponse | null = null;
    const rawJson = response.choices[0]?.message?.content;
    if (rawJson) {
      try {
        const cleanedText = rawJson.replace(/^```json\s*|```$/g, "").trim();
        aiResult = JSON.parse(cleanedText) as AISchemaResponse;
      } catch (parseError) {
        console.error("JSON parse error from DeepSeek output:", rawJson);
        throw parseError;
      }
    }

    if (!aiResult || !aiResult.stories) {
      throw new Error("Wrong AI response format");
    }

    const finalizedStoried: Ranked[] = aiResult.stories.map((story) => {
      const sources: Source[] = [];

      if (Array.isArray(story.matched_article_id)) {
        story.matched_article_id.forEach((id) => {
          const originalArticle = articleMap.get(id);
          if (originalArticle) {
            sources.push({
              portal: originalArticle.source,
              url: originalArticle.link,
            });
          }
        });
      }

      return {
        rank: story.rank,
        title: story.title,
        summary: story.description,
        sources: sources,
      };
    });

    return { stories: finalizedStoried };
  } catch (error) {
    console.error("AI grouping failed: ", error);
    return { stories: [] };
  }
}
