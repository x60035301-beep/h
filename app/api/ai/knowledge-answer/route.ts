import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiJson, isAiEnabled } from "@/lib/ai/openrouter";

const schema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  question: z.string().trim().min(2).max(1000)
});

type KnowledgeAnswer = {
  answer: string;
  references: string[];
  suggestedActions: string[];
};

const fallback: KnowledgeAnswer = {
  answer: "请先确认客户的产品用途、密度、尺寸、数量和目的港，再结合 HOMY 产品知识、报价模板和物流规则生成回复。",
  references: ["HOMY knowledge base"],
  suggestedActions: ["补充客户需求。", "选择对应报价或话术模板。", "安排下一步跟进。"]
};

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    if (!isAiEnabled()) return NextResponse.json({ data: { result: fallback, mode: "rules-engine-v1" } });

    const result = await generateAiJson<KnowledgeAnswer>({
      messages: [
        {
          role: "system",
          content: buildHomySystemPrompt(payload.locale, "Answer the user's question using HOMY knowledge base context. Cite relevant knowledge titles in references.")
        },
        {
          role: "user",
          content: [
            `Question: ${payload.question}`,
            "Return JSON only with shape:",
            '{ "answer": string, "references": string[], "suggestedActions": string[] }'
          ].join("\n")
        }
      ],
      fallback,
      maxTokens: 1600
    });

    return NextResponse.json({ data: { result: normalize(result.data), mode: `openrouter:${result.model}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI knowledge answer failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function normalize(value: KnowledgeAnswer): KnowledgeAnswer {
  return {
    ...fallback,
    ...value,
    references: Array.isArray(value.references) ? value.references.slice(0, 6) : fallback.references,
    suggestedActions: Array.isArray(value.suggestedActions) ? value.suggestedActions.slice(0, 6) : fallback.suggestedActions
  };
}
