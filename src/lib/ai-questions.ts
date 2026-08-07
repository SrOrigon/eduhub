export type GeneratedQuestion = {
  prompt: string;
  type: "choice" | "text";
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
};

const TEMPLATES: Record<string, (topic: string, i: number) => GeneratedQuestion> = {
  Matemática: (topic, i) => ({
    prompt: `(${i + 1}) Sobre ${topic}: qual alternativa está correta?`,
    type: "choice",
    points: 1,
    options: [
      { id: "a", text: `Resposta correta sobre ${topic}`, isCorrect: true },
      { id: "b", text: `Alternativa incorreta A`, isCorrect: false },
      { id: "c", text: `Alternativa incorreta B`, isCorrect: false },
      { id: "d", text: `Alternativa incorreta C`, isCorrect: false },
    ],
  }),
  Português: (topic, i) => ({
    prompt: `(${i + 1}) Leia e responda sobre ${topic}:`,
    type: "choice",
    points: 1,
    options: [
      { id: "a", text: `Interpretação correta de ${topic}`, isCorrect: true },
      { id: "b", text: `Interpretação parcial`, isCorrect: false },
      { id: "c", text: `Interpretação incorreta`, isCorrect: false },
    ],
  }),
};

function defaultTemplate(topic: string, i: number): GeneratedQuestion {
  return {
    prompt: `(${i + 1}) Explique ou escolha a resposta correta sobre: ${topic}`,
    type: i % 3 === 2 ? "text" : "choice",
    points: 1,
    options:
      i % 3 === 2
        ? []
        : [
            { id: "a", text: `Conceito principal de ${topic}`, isCorrect: true },
            { id: "b", text: `Conceito secundário`, isCorrect: false },
            { id: "c", text: `Conceito irrelevante`, isCorrect: false },
          ],
  };
}

export function generateQuestionsLocally(
  topic: string,
  subject: string,
  count: number
): GeneratedQuestion[] {
  const fn = TEMPLATES[subject] ?? defaultTemplate;
  return Array.from({ length: Math.min(Math.max(count, 1), 10) }, (_, i) => fn(topic, i));
}

export async function generateQuestionsWithAi(
  topic: string,
  subject: string,
  count: number,
  bncc?: string
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateQuestionsLocally(topic, subject, count);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Gere questões escolares em português. Retorne JSON: { "questions": [{ "prompt": string, "type": "choice"|"text", "points": number, "options": [{ "id": "a"|"b"|"c"|"d", "text": string, "isCorrect": boolean }] }] }. Para type text, options=[].',
          },
          {
            role: "user",
            content: `Matéria: ${subject}. Tema: ${topic}. Quantidade: ${count}.${bncc ? ` BNCC: ${bncc}.` : ""}`,
          },
        ],
      }),
    });

    if (!res.ok) return generateQuestionsLocally(topic, subject, count);

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return generateQuestionsLocally(topic, subject, count);

    const parsed = JSON.parse(content) as { questions?: GeneratedQuestion[] };
    if (!parsed.questions?.length) return generateQuestionsLocally(topic, subject, count);

    return parsed.questions.slice(0, 10).map((q) => ({
      prompt: q.prompt,
      type: q.type === "text" ? "text" : "choice",
      points: q.points || 1,
      options: q.type === "text" ? [] : (q.options ?? []),
    }));
  } catch {
    return generateQuestionsLocally(topic, subject, count);
  }
}
