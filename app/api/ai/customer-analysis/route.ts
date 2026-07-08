import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiJson, isAiEnabled } from "@/lib/ai/openrouter";

const schema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  customer: z.record(z.string(), z.unknown()).optional().default({})
});

type CustomerAnalysis = {
  score: number;
  winProbability: number;
  churnRisk: number;
  valueLevel: string;
  recommendedFollowUpTime: string;
  summary: string;
  strategy: string;
  report: string[];
};

const fallback: CustomerAnalysis = {
  score: 76,
  winProbability: 58,
  churnRisk: 24,
  valueLevel: "Growth",
  recommendedFollowUpTime: "Next business day",
  summary: "客户具备继续跟进价值，建议确认需求、预算、规格和下一步样品或报价动作。",
  strategy: "先确认真实采购周期和目标规格，再用稳定密度、交期和长期供货能力推进。",
  report: ["补充采购数量和目标价格。", "确认样品或报价有效期。", "安排下一次 WhatsApp 或邮件跟进。"]
};

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    if (!isAiEnabled()) return NextResponse.json({ data: { analysis: fallback, mode: "rules-engine-v1" } });

    const result = await generateAiJson<CustomerAnalysis>({
      messages: [
        {
          role: "system",
          content: buildHomySystemPrompt(payload.locale, "Analyze one CRM customer and produce a sales-focused customer 360 AI analysis.")
        },
        {
          role: "user",
          content: [
            "Customer data:",
            JSON.stringify(payload.customer, null, 2),
            "Return JSON only with shape:",
            '{ "score": number, "winProbability": number, "churnRisk": number, "valueLevel": string, "recommendedFollowUpTime": string, "summary": string, "strategy": string, "report": string[] }'
          ].join("\n")
        }
      ],
      fallback,
      maxTokens: 1800
    });

    return NextResponse.json({ data: { analysis: normalizeAnalysis(result.data), mode: `openrouter:${result.model}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI customer analysis failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function normalizeAnalysis(value: CustomerAnalysis): CustomerAnalysis {
  return {
    ...fallback,
    ...value,
    score: clamp(value.score),
    winProbability: clamp(value.winProbability),
    churnRisk: clamp(value.churnRisk),
    report: Array.isArray(value.report) ? value.report.slice(0, 6) : fallback.report
  };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0));
}
