import { aiExtensionPoints } from "@/config/crm";

export type AiExtensionPoint = (typeof aiExtensionPoints)[number];

export async function invokeAiExtension<TInput, TOutput>(
  point: AiExtensionPoint,
  input: TInput
): Promise<TOutput | null> {
  if (process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED !== "true") {
    return null;
  }

  // V1 intentionally keeps AI disabled. V2 can route this to OpenAI, WhatsApp, or pricing services.
  console.info(`[AI placeholder] ${point}`, input);
  return null;
}
