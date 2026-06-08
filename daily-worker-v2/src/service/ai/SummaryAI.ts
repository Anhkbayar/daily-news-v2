import { deepseek } from "./Deepseek";

interface AiSummarySchema {
  summary: string,
  date: Date,
}

export async function generateSummary(
  descriptions: string[],
): Promise<AiSummarySchema> {
  if (descriptions.length === 0) {
    return { summary: "", date: new Date() };
  }

  const articleDigest = descriptions
    .map((description, i) => `[${i + 1}] ${description}`)
    .join("\n");

  const prompt = `Өнөөдрийн Монголын мэдээний тайлбаруудыг доор жагсаав.

Даалгавар:
Дээрх мэдээнүүдийг хамгийн чухал гэсэн хэсгүүдийг аваад, дараах дүрмийг баримтлан, 300–400 үгтэй (ойролцоогоор 2 минут унших) нэгэн төрлийн тойм бич.

Дүрэм:
- Зөвхөн Монгол хэлээр (Кирилл үсэг) бич.
- Цэгтэй жагсаалт, дугаарлалт, харваас ашиглахгүй.
- Өгүүллийн дугаар, эх сурвалжийг дурдахгүй.
- Холбоотой сэдвүүдийг байгалийн жамаар нэгтгэ.
- Төгсгөлд нь товч хаалтын өгүүлбэр оруулах.

Мэдээний жагсаалт:
${articleDigest}

Одоо дээрх дүрмийн дагуу 2 минутын тоймоо бич.`

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-v4-flash",
      max_tokens: 8192,

      messages: [
        {
          role: "system",
          content: `You are a professional news editor for "Mongolia Daily Flash", a trusted Mongolian news digest.`
        },
        {
          role: "user",
          content: prompt
        },
      ]

    })


    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    return {
      summary: content,
      date: new Date()
    };
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return { summary: "", date: new Date() };
  }
}
