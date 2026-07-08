import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { customerSchema } from "@/lib/validations";

const importSchema = z.object({
  customers: z.array(customerSchema).min(1).max(500)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = importSchema.parse({ customers: body.customers ?? body.rows ?? [] });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const rows = payload.customers.map((customer) => ({
      ...customer,
      owner_id: context.profile.id
    }));

    const { data, error } = await context.supabase.from("customers").insert(rows).select();
    if (error) throw error;

    const contacts = (data ?? [])
      .filter((customer) => customer.contact_name)
      .map((customer) => ({
        customer_id: customer.id,
        name: customer.contact_name,
        email: customer.email || null,
        whatsapp: customer.whatsapp || null,
        is_primary: true
      }));

    if (contacts.length) {
      const { error: contactsError } = await context.supabase.from("contacts").insert(contacts);
      if (contactsError) throw contactsError;
    }

    const activities = (data ?? []).map((customer) => ({
      actor_id: context.profile.id,
      customer_id: customer.id,
      type: "customer_created" as const,
      title: "批量导入客户",
      description: customer.company_name
    }));

    if (activities.length) {
      const { error: activityError } = await context.supabase.from("activities").insert(activities);
      if (activityError) throw activityError;
    }

    return NextResponse.json({ count: data?.length ?? 0 }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
