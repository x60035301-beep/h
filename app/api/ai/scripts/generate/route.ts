import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiJson, isAiEnabled } from "@/lib/ai/openrouter";

const schema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  category: z.string().min(1),
  count: z.number().int().min(1).max(8).default(6)
});

type GeneratedScript = {
  title: string;
  content_zh: string;
  content_id: string;
  tags: string[];
};

const fallback: GeneratedScript[] = [];

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    if (!isAiEnabled()) {
      return NextResponse.json({ data: { scripts: fallback, mode: "rules-engine-v1" } });
    }

    const result = await generateAiJson<GeneratedScript[]>({
      messages: [
        {
          role: "system",
          content: buildHomySystemPrompt(
            payload.locale,
            "Generate sales script templates for HOMY. Each template must be customer-ready, practical, and specific to foam export sales."
          )
        },
        {
          role: "user",
          content: [
            `Category: ${payload.category}`,
            `Generate ${payload.count} different templates.`,
            "Return JSON array only. Each item shape:",
            '{ "title": string, "content_zh": string, "content_id": string, "tags": string[] }',
            "content_zh must be Chinese. content_id must be Bahasa Indonesia. tags should be short Chinese tags."
          ].join("\n")
        }
      ],
      fallback,
      maxTokens: 2600
    });

    const scripts = Array.isArray(result.data) ? result.data.slice(0, payload.count) : fallback;
    return NextResponse.json({ data: { scripts, mode: `openrouter:${result.model}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI script generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
