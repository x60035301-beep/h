import { knowledgeItems, text } from "@/data/ai-crm";
import type { Locale } from "@/types/crm";

type Message = {
  role: "system" | "user";
  content: string;
};

type OpenRouterMessageContent =
  | string
  | Array<{
      type?: string;
      text?: string;
      content?: string;
    }>;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: OpenRouterMessageContent;
    };
  }>;
  error?: {
    message?: string;
  };
};

export function isAiEnabled() {
  return process.env.AI_PROVIDER === "openrouter" && Boolean(process.env.OPENROUTER_API_KEY);
}

export function getAiModel() {
  return process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
}

export async function generateAiText({
  messages,
  temperature = 0.35,
  maxTokens = 1200
}: {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}) {
  if (!isAiEnabled()) {
    throw new Error("AI is not configured. Set AI_PROVIDER=openrouter and OPENROUTER_API_KEY.");
  }

  const model = getAiModel();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3001",
      "X-Title": process.env.OPENROUTER_APP_NAME || "HOMY AI Sales CRM"
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages
    })
  });

  const payload = (await response.json().catch(() => null)) as OpenRouterResponse | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `OpenRouter request failed with status ${response.status}`);
  }

  const reply = extractContentText(payload?.choices?.[0]?.message?.content);
  if (!reply) throw new Error("OpenRouter returned an empty reply.");

  return { text: reply, model };
}

export async function generateAiJson<T>({
  messages,
  temperature = 0.25,
  maxTokens = 1400,
  fallback
}: {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  fallback: T;
}) {
  const { text: output, model } = await generateAiText({
    messages: [
      ...messages,
      {
        role: "system",
        content: "Return only valid JSON. Do not wrap it in markdown fences."
      }
    ],
    temperature,
    maxTokens
  });

  return { data: parseJsonOrFallback(output, fallback), raw: output, model };
}

export function buildHomySystemPrompt(locale: Locale, extra?: string) {
  const languageInstruction = {
    zh: "请主要用中文回答；如果生成客户话术，可按需要附英文或印尼语版本。",
    en: "Reply mainly in English; include Chinese or Indonesian customer-ready copy when useful.",
    id: "Jawab terutama dalam Bahasa Indonesia; sertakan versi Mandarin atau Inggris bila berguna."
  } satisfies Record<Locale, string>;

  return [
    "You are HOMY AI Sales Assistant for an Indonesian sponge/foam factory.",
    "Help export salespeople with customer development, quotations, samples, WhatsApp replies, objections, production timing, logistics, after-sales, and business analysis.",
    "Be practical, concise, B2B, and ready to use. Do not invent exact prices unless data is provided.",
    languageInstruction[locale],
    buildKnowledgeContext(locale),
    extra
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildKnowledgeContext(locale: Locale) {
  const knowledge = knowledgeItems
    .map((item) => `- ${item.title} (${text(item.category, locale)}): ${item.tags.join(", ")}`)
    .join("\n");

  return `HOMY knowledge base:\n${knowledge}`;
}

function extractContentText(content: OpenRouterMessageContent | undefined) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => item.text ?? item.content ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseJsonOrFallback<T>(value: string, fallback: T) {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) return fallback;

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return fallback;
    }
  }
}
