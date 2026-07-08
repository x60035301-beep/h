import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Clock, DollarSign } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerStages } from "@/config/crm";
import { getCustomers, getQuotations } from "@/data/queries";
import { pipelineStages, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { CustomerStage } from "@/types/crm";

const labels = {
  zh: { back: "返回销售 Pipeline", customers: "阶段客户", amount: "阶段金额", dwell: "平均停留", conversion: "成交率", empty: "暂无该阶段客户", days: "天" },
  en: { back: "Back to pipeline", customers: "Stage customers", amount: "Stage amount", dwell: "Avg dwell", conversion: "Conversion", empty: "No customers in this stage", days: "days" },
  id: { back: "Kembali ke pipeline", customers: "Pelanggan tahap ini", amount: "Nilai tahap", dwell: "Rata-rata tinggal", conversion: "Konversi", empty: "Belum ada pelanggan di tahap ini", days: "hari" }
} as const;

const stageMap: Record<string, CustomerStage | null> = {
  lead: "new_inquiry",
  inquiry: "new_inquiry",
  contacted: "contacted",
  quotation: "quoted",
  sample: "sampling",
  negotiation: "negotiation",
  payment: "won",
  production: null,
  shipment: null,
  completed: "won",
  repeat: "won"
};

export default async function PipelineStagePage({
  params
}: {
  params: Promise<{ locale: string; stage: string }>;
}) {
  const { locale: localeParam, stage: stageParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const page = labels[locale];
  const stageKey = decodeURIComponent(stageParam);
  const stage = pipelineStages.find((item) => item.key === stageKey);
  if (!stage) notFound();

  const crmStage = stageMap[stageKey] ?? null;
  const [customers, quotations] = await Promise.all([getCustomers(), getQuotations()]);
  const stageCustomers = crmStage ? customers.filter((customer) => customer.stage === crmStage) : [];
  const customerIds = new Set(stageCustomers.map((customer) => customer.id));
  const amount = quotations
    .filter((quotation) => customerIds.has(quotation.customer_id))
    .reduce((sum, quotation) => sum + Number(quotation.total_amount ?? 0), 0);
  const conversion = customers.length ? Math.round((stageCustomers.length / customers.length) * 100) : 0;
  const stageLabel = crmStage ? customerStages.find((item) => item.value === crmStage)?.label : text(stage.label, locale);

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/pipeline`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader title={stageLabel ?? text(stage.label, locale)} description={`${page.customers}: ${stageCustomers.length} · ${page.amount}: ${formatCurrency(amount)}`} />

      <section className="grid gap-4 md:grid-cols-4">
        <Summary icon={<Building2 className="size-4" />} label={page.customers} value={stageCustomers.length.toString()} />
        <Summary icon={<DollarSign className="size-4" />} label={page.amount} value={formatCurrency(amount)} />
        <Summary icon={<Clock className="size-4" />} label={page.dwell} value={`${stage.dwell} ${page.days}`} />
        <Summary icon={<Building2 className="size-4" />} label={page.conversion} value={`${conversion}%`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{page.customers}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {stageCustomers.length ? (
            stageCustomers.map((customer, index) => (
              <Link key={customer.id} href={`/${locale}/customers/${customer.id}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="rounded-md border p-4 transition hover:border-primary/40 hover:bg-accent">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{customer.company_name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{customer.country ?? "-"} · {customer.industry ?? "-"}</p>
                    </div>
                    <Badge variant={customer.grade === "A" ? "success" : "secondary"}>{customer.grade}</Badge>
                  </div>
                  <ProgressLine value={Math.max(15, conversion - index * 8)} className="mt-4" />
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-md border p-6 text-sm text-muted-foreground">{page.empty}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <span className="mb-3 flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">{icon}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
