import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import type { Locale } from "@/types/crm";

const workflowRunSchema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  steps: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        type: z.string().min(1)
      })
    )
    .min(1)
    .max(30)
});

export async function POST(request: Request) {
  try {
    const payload = workflowRunSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const now = new Date();
    const runId = globalThis.crypto.randomUUID();
    const events = payload.steps.map((step, index) => ({
      id: step.id,
      index: index + 1,
      status: "success" as const,
      message: buildEventMessage(step.label, step.type, payload.locale),
      durationMs: 280 + index * 35
    }));

    const { error } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: null,
      type: "workflow_run",
      title: buildActivityTitle(payload.locale),
      description: buildActivityDescription(payload.steps.length, payload.locale),
      metadata: {
        run_id: runId,
        steps: payload.steps,
        events
      }
    });
    if (error) throw error;

    return NextResponse.json({
      data: {
        runId,
        status: "success",
        startedAt: now.toISOString(),
        finishedAt: new Date(now.getTime() + payload.steps.length * 420).toISOString(),
        events
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function buildEventMessage(label: string, type: string, locale: Locale) {
  if (locale === "en") return `${type} completed: ${label}`;
  if (locale === "id") return `${type} selesai: ${label}`;
  return `${type} 已完成：${label}`;
}

function buildActivityTitle(locale: Locale) {
  if (locale === "en") return "Workflow run";
  if (locale === "id") return "Workflow dijalankan";
  return "运行 Workflow";
}

function buildActivityDescription(count: number, locale: Locale) {
  if (locale === "en") return `${count} workflow nodes completed`;
  if (locale === "id") return `${count} node workflow selesai`;
  return `${count} 个流程节点已完成`;
}
