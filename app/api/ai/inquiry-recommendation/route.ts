import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiJson, isAiEnabled } from "@/lib/ai/openrouter";

const schema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  inquiry: z.record(z.string(), z.unknown()).default({})
});

type InquiryRecommendation = {
  productType: string;
  recommendedSpec: string;
  suggestedQuote: string;
  confidence: number;
  questions: string[];
  nextSteps: string[];
};

const fallback: InquiryRecommendation = {
  productType: "High resilience sofa foam",
  recommendedSpec: "30D / confirm size and thickness before quotation",
  suggestedQuote: "Prepare sample quote after quantity and Incoterms are confirmed",
  confidence: 68,
  questions: ["确认用途、密度、尺寸、数量和目的港。"],
  nextSteps: ["发送产品参数表。", "确认样品需求。", "准备正式报价。"]
};

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    if (!isAiEnabled()) return NextResponse.json({ data: { recommendation: fallback, mode: "rules-engine-v1" } });

    const result = await generateAiJson<InquiryRecommendation>({
      messages: [
        {
          role: "system",
          content: buildHomySystemPrompt(payload.locale, "Recommend foam product type, specification, quote direction, questions, and next steps for one inquiry.")
        },
        {
          role: "user",
          content: [
            "Inquiry data:",
            JSON.stringify(payload.inquiry, null, 2),
            "Return JSON only with shape:",
            '{ "productType": string, "recommendedSpec": string, "suggestedQuote": string, "confidence": number, "questions": string[], "nextSteps": string[] }'
          ].join("\n")
        }
      ],
      fallback,
      maxTokens: 1600
    });

    return NextResponse.json({ data: { recommendation: normalize(result.data), mode: `openrouter:${result.model}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI inquiry recommendation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function normalize(value: InquiryRecommendation): InquiryRecommendation {
  return {
    ...fallback,
    ...value,
    confidence: Math.max(0, Math.min(100, Math.round(value.confidence ?? fallback.confidence))),
    questions: Array.isArray(value.questions) ? value.questions.slice(0, 6) : fallback.questions,
    nextSteps: Array.isArray(value.nextSteps) ? value.nextSteps.slice(0, 6) : fallback.nextSteps
  };
}
