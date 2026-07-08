import { customerStages } from "@/config/crm";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAll } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type {
  Activity,
  AppUser,
  Attachment,
  CompanySettings,
  CustomerSummary,
  DashboardStats,
  Followup,
  Product,
  Quotation,
  QuotationItem,
  Reminder,
  Script,
  UserRole,
  StageCount
} from "@/types/crm";

const emptySettings: CompanySettings = {
  id: "unconfigured",
  logo_url: null,
  company_name: "HOMY Sponge Factory",
  phone: null,
  email: null,
  address: null
};

export async function getCustomers(): Promise<CustomerSummary[]> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!supabase || !profile) return [];

  let query = supabase
    .from("customers")
    .select("id,owner_id,company_name,contact_name,country,industry,company_type,whatsapp,email,source,grade,stage,last_contacted_at,created_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (!canManageAll(profile.role)) {
    query = query.eq("owner_id", profile.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CustomerSummary[];
}

export async function getCustomerDetail(id: string) {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const [{ data: customer, error: customerError }, { data: contacts }, { data: followups }, { data: quotations }, { data: attachments }] =
    await Promise.all([
      supabase.from("customers").select("*").eq("id", id).is("deleted_at", null).single(),
      supabase.from("contacts").select("*").eq("customer_id", id).is("deleted_at", null).order("is_primary", { ascending: false }),
      supabase.from("followups").select("*").eq("customer_id", id).is("deleted_at", null).order("followed_at", { ascending: false }),
      supabase.from("quotations").select("*").eq("customer_id", id).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("attachments").select("*").eq("customer_id", id).is("deleted_at", null).order("created_at", { ascending: false })
    ]);

  if (customerError) throw customerError;

  const quotationIds = (quotations ?? []).map((quotation) => quotation.id);
  const { data: quotationItems } = quotationIds.length
    ? await supabase.from("quotation_items").select("*").in("quotation_id", quotationIds).is("deleted_at", null)
    : { data: [] };

  return {
    customer: customer as CustomerSummary & { notes?: string | null },
    contacts: contacts ?? [],
    followups: (followups ?? []) as Followup[],
    quotations: (quotations ?? []) as Quotation[],
    quotationItems: (quotationItems ?? []) as QuotationItem[],
    attachments: (attachments ?? []) as Attachment[]
  };
}

export async function getDashboardData(): Promise<{
  stats: DashboardStats;
  stageCounts: StageCount[];
  activities: Activity[];
  reminders: Reminder[];
}> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!supabase || !profile) {
    return {
      stats: {
        totalCustomers: 0,
        newCustomersToday: 0,
        pendingFollowups: 0,
        quotationsToday: 0,
        wonCustomers: 0,
        revenueAmount: 0
      },
      stageCounts: customerStages.map((stage) => ({ stage: stage.value, count: 0, amount: 0 })),
      activities: [],
      reminders: []
    };
  }

  const customersQuery = supabase.from("customers").select("*").is("deleted_at", null);
  const { data: customers } = canManageAll(profile.role) ? await customersQuery : await customersQuery.eq("owner_id", profile.id);

  const today = new Date().toISOString().slice(0, 10);
  const { data: quotations } = await supabase.from("quotations").select("*").is("deleted_at", null);
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("is_done", false)
    .is("deleted_at", null)
    .order("due_at", { ascending: true })
    .limit(8);
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  const rows = customers ?? [];
  const quoteRows = quotations ?? [];

  const stageCounts = customerStages.map((stage) => ({
    stage: stage.value,
    count: rows.filter((customer) => customer.stage === stage.value).length,
    amount: quoteRows
      .filter((quote) => quote.status === "accepted")
      .reduce((sum, quote) => sum + Number(quote.total_amount ?? 0), 0)
  }));

  return {
    stats: {
      totalCustomers: rows.length,
      newCustomersToday: rows.filter((customer) => customer.created_at?.startsWith(today)).length,
      pendingFollowups: reminders?.length ?? 0,
      quotationsToday: quoteRows.filter((quote) => quote.created_at?.startsWith(today)).length,
      wonCustomers: rows.filter((customer) => customer.stage === "won").length,
      revenueAmount: quoteRows.filter((quote) => quote.status === "accepted").reduce((sum, quote) => sum + Number(quote.total_amount ?? 0), 0)
    },
    stageCounts,
    activities: (activities ?? []) as Activity[],
    reminders: (reminders ?? []) as Reminder[]
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, product_categories(name)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => ({
    ...item,
    category_name: Array.isArray(item.product_categories) ? item.product_categories[0]?.name : item.product_categories?.name
  })) as Product[];
}

export async function getQuotations(): Promise<Quotation[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("quotations").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Quotation[];
}

export async function getQuotationItems(quotationIds: string[]): Promise<QuotationItem[]> {
  const supabase = await createClient();
  if (!supabase || quotationIds.length === 0) return [];

  const { data, error } = await supabase
    .from("quotation_items")
    .select("*")
    .in("quotation_id", quotationIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as QuotationItem[];
}

export async function getScripts(): Promise<Script[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("scripts")
    .select("*, script_categories(name)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => ({
    ...item,
    category_name: Array.isArray(item.script_categories) ? item.script_categories[0]?.name : item.script_categories?.name,
    is_favorite: false
  })) as Script[];
}

export async function getAttachments(): Promise<Attachment[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("attachments").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Attachment[];
}

export async function getReminders(): Promise<Reminder[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("reminders").select("*").is("deleted_at", null).order("due_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reminder[];
}

export async function getAnalyticsData() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!supabase || !profile) {
    return {
      sourceDistribution: [],
      countryDistribution: [],
      growthTrend: [],
      stageCounts: customerStages.map((stage) => ({ stage: stage.value, count: 0, amount: 0 }))
    };
  }

  let customersQuery = supabase
    .from("customers")
    .select("id,owner_id,source,country,stage,created_at")
    .is("deleted_at", null);

  if (!canManageAll(profile.role)) customersQuery = customersQuery.eq("owner_id", profile.id);

  const [{ data: customers, error: customersError }, { data: quotations, error: quotationsError }] = await Promise.all([
    customersQuery,
    supabase.from("quotations").select("id,customer_id,status,created_at").is("deleted_at", null)
  ]);

  if (customersError) throw customersError;
  if (quotationsError) throw quotationsError;

  const rows = customers ?? [];
  const quotationRows = quotations ?? [];
  const accessibleCustomerIds = new Set(rows.map((customer) => customer.id));
  const visibleQuotations = canManageAll(profile.role)
    ? quotationRows
    : quotationRows.filter((quotation) => accessibleCustomerIds.has(quotation.customer_id));
  const monthKeys = buildRecentMonthKeys(6);

  return {
    sourceDistribution: toCountList(rows.map((customer) => customer.source ?? "Unknown"), "value"),
    countryDistribution: toCountList(rows.map((customer) => customer.country ?? "Unknown"), "customers"),
    growthTrend: monthKeys.map((month) => ({
      month,
      customers: rows.filter((customer) => customer.created_at?.startsWith(month)).length,
      quotations: visibleQuotations.filter((quotation) => quotation.created_at?.startsWith(month)).length,
      won: rows.filter((customer) => customer.stage === "won" && customer.created_at?.startsWith(month)).length
    })),
    stageCounts: customerStages.map((stage) => ({
      stage: stage.value,
      count: rows.filter((customer) => customer.stage === stage.value).length
    }))
  };
}

export async function getUsersByRoles(roles: UserRole[]): Promise<AppUser[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("users")
    .select("id,email,full_name,avatar_url,roles(code)")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const roleRelation = row.roles as { code?: UserRole } | Array<{ code?: UserRole }> | null;
      const role = Array.isArray(roleRelation) ? roleRelation[0]?.code : roleRelation?.code;
      return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        role: role ?? "sales"
      };
    })
    .filter((user) => roles.includes(user.role));
}

export async function getSettings(): Promise<CompanySettings> {
  const supabase = await createClient();
  if (!supabase) return emptySettings;

  const { data, error } = await supabase.from("settings").select("*").is("deleted_at", null).limit(1).maybeSingle();
  if (error) throw error;
  return (data ?? emptySettings) as CompanySettings;
}

function toCountList<T extends "value" | "customers">(items: string[], valueKey: T): Array<{ name: string } & Record<T, number>> {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, [valueKey]: count }) as { name: string } & Record<T, number>)
    .sort((a, b) => b[valueKey] - a[valueKey]);
}

function buildRecentMonthKeys(count: number) {
  const now = new Date();
  return Array.from({ length: count })
    .map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
}
