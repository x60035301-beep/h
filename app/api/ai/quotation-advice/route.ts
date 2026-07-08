import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiJson, isAiEnabled } from "@/lib/ai/openrouter";

const schema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  quotation: z.record(z.string(), z.unknown()).default({})
});

type QuotationAdvice = {
  materialCostRatio: number;
  laborCostRatio: number;
  packingCostRatio: number;
  freightCostRatio: number;
  suggestedMargin: number;
  minimumPriceNote: string;
  suggestedPriceNote: string;
  riskNotes: string[];
  customerMessage: string;
};

const fallback: QuotationAdvice = {
  materialCostRatio: 62,
  laborCostRatio: 8,
  packingCostRatio: 6,
  freightCostRatio: 10,
  suggestedMargin: 18,
  minimumPriceNote: "最低售价需要根据实际密度、损耗、包装体积和运费确认。",
  suggestedPriceNote: "建议报价保留 15%-22% 利润空间，并按数量提供阶梯价。",
  riskNotes: ["确认密度和尺寸公差。", "确认 Incoterms 和目的港。", "确认原料价格有效期。"],
  customerMessage: "我们可以根据目标数量和目的港优化装柜方案，并提供标准版和经济版两个报价选项。"
};

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    if (!isAiEnabled()) return NextResponse.json({ data: { advice: fallback, mode: "rules-engine-v1" } });

    const result = await generateAiJson<QuotationAdvice>({
      messages: [
        {
          role: "system",
          content: buildHomySystemPrompt(payload.locale, "Review a foam quotation and provide costing, margin, risk, and customer-ready advice.")
        },
        {
          role: "user",
          content: [
            "Quotation data:",
            JSON.stringify(payload.quotation, null, 2),
            "Return JSON only with shape:",
            '{ "materialCostRatio": number, "laborCostRatio": number, "packingCostRatio": number, "freightCostRatio": number, "suggestedMargin": number, "minimumPriceNote": string, "suggestedPriceNote": string, "riskNotes": string[], "customerMessage": string }'
          ].join("\n")
        }
      ],
      fallback,
      maxTokens: 1800
    });

    return NextResponse.json({ data: { advice: normalize(result.data), mode: `openrouter:${result.model}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI quotation advice failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function normalize(value: QuotationAdvice): QuotationAdvice {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
  return {
    ...fallback,
    ...value,
    materialCostRatio: clamp(value.materialCostRatio),
    laborCostRatio: clamp(value.laborCostRatio),
    packingCostRatio: clamp(value.packingCostRatio),
    freightCostRatio: clamp(value.freightCostRatio),
    suggestedMargin: clamp(value.suggestedMargin),
    riskNotes: Array.isArray(value.riskNotes) ? value.riskNotes.slice(0, 6) : fallback.riskNotes
  };
}
