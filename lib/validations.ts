import { z } from "zod";

import {
  communicationMethods,
  companyTypes,
  customerGrades,
  customerStages,
  quotationStatuses,
  reminderTypes
} from "@/config/crm";
import { currencyCodes } from "@/lib/currencies";

export const customerSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  contact_name: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  company_type: z.enum(companyTypes.map((item) => item.value) as [string, ...string[]]).optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  source: z.string().optional().nullable(),
  grade: z.enum(customerGrades),
  stage: z.enum(customerStages.map((item) => item.value) as [string, ...string[]]),
  notes: z.string().optional().nullable()
});

export const followupSchema = z.object({
  customer_id: z.string().uuid(),
  method: z.enum(communicationMethods.map((item) => item.value) as [string, ...string[]]),
  followed_at: z.string().min(1),
  content: z.string().min(3, "Follow-up content is required"),
  next_step: z.string().optional().nullable()
});

export const productSchema = z.object({
  name: z.string().min(2),
  category_id: z.string().uuid().optional().nullable(),
  specification: z.string().optional().nullable(),
  density: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().or(z.literal("")).nullable(),
  pdf_url: z.string().url().optional().or(z.literal("")).nullable()
});

export const quotationItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  product_name: z.string().min(2),
  density: z.string().optional().nullable(),
  specification: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
  notes: z.string().optional().nullable()
});

export const quotationSchema = z.object({
  customer_id: z.string().uuid(),
  status: z.enum(quotationStatuses.map((item) => item.value) as [string, ...string[]]).default("draft"),
  currency: z
    .string()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum(currencyCodes))
    .default("USD"),
  notes: z.string().optional().nullable(),
  valid_until: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1)
});

export const scriptSchema = z.object({
  title: z.string().min(2),
  category_id: z.string().uuid().optional().nullable(),
  content_zh: z.string().min(3),
  content_id: z.string().min(3),
  tags: z.array(z.string()).default([])
});

export const reminderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  title: z.string().min(2),
  type: z.enum(reminderTypes.map((item) => item.value) as [string, ...string[]]),
  due_at: z.string().min(1),
  is_done: z.boolean().default(false)
});

export const settingsSchema = z.object({
  logo_url: z.string().url().optional().or(z.literal("")).nullable(),
  company_name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable()
});

export const stageUpdateSchema = z.object({
  customer_id: z.string().uuid(),
  stage: z.enum(customerStages.map((item) => item.value) as [string, ...string[]])
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type FollowupInput = z.infer<typeof followupSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
export type ScriptInput = z.infer<typeof scriptSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
