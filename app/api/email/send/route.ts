import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { hasEmailWebhookEnv } from "@/lib/env";

const emailSendSchema = z.object({
  customer_id: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().trim().min(2).max(160),
  body: z.string().trim().min(10).max(6000),
  template: z.string().optional().nullable()
});

export async function POST(request: Request) {
  try {
    const payload = emailSendSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    if (!hasEmailWebhookEnv()) {
      return NextResponse.json(
        {
          error: "Email service is not configured. Set EMAIL_WEBHOOK_URL and EMAIL_FROM before sending production emails."
        },
        { status: 503 }
      );
    }

    const sentAt = new Date().toISOString();
    const deliveryResponse = await fetch(process.env.EMAIL_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
        template: payload.template ?? "custom",
        customer_id: payload.customer_id,
        sent_by: context.profile.id
      })
    });

    if (!deliveryResponse.ok) {
      const detail = await deliveryResponse.text().catch(() => "");
      return NextResponse.json({ error: `Email provider rejected the message. ${detail}`.trim() }, { status: 502 });
    }

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "email_sent",
      title: "发送邮件",
      description: `${payload.subject} -> ${payload.to}`,
      metadata: {
        to: payload.to,
        subject: payload.subject,
        template: payload.template ?? "custom"
      }
    });
    if (activityError) throw activityError;

    return NextResponse.json({
      data: {
        id: `email-${globalThis.crypto.randomUUID()}`,
        customer_id: payload.customer_id,
        to: payload.to,
        subject: payload.subject,
        template: payload.template ?? "custom",
        status: "sent",
        sent_at: sentAt
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
