import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ConditionMonitorWorkspace } from "@/components/ai-crm/condition-monitor-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

type ConditionRule = "no-contact-3d" | "no-quote-7d";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  zh: {
    title: "条件监控",
    description: "查看 Workflow 条件触发结果，并为客户创建跟进提醒。",
    back: "返回 Workflow"
  },
  en: {
    title: "Condition Monitor",
    description: "Review workflow condition results and create follow-up reminders for customers.",
    back: "Back to Workflow"
  },
  id: {
    title: "Monitor Kondisi",
    description: "Lihat hasil kondisi workflow dan buat reminder follow-up untuk pelanggan.",
    back: "Kembali ke Workflow"
  }
};

export default async function ConditionMonitorPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ rule?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { rule: ruleParam } = await searchParams;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const initialRule: ConditionRule = ruleParam === "no-quote-7d" ? "no-quote-7d" : "no-contact-3d";
  const customers = await getCustomers();
  const page = copy[locale];

  return (
    <div className="page-shell">
      <PageHeader
        title={page.title}
        description={page.description}
        actions={
          <Button asChild variant="outline">
            <Link href={`/${locale}/workflows`}>
              <ArrowLeft className="size-4" />
              {page.back}
            </Link>
          </Button>
        }
      />
      <ConditionMonitorWorkspace locale={locale} customers={customers} initialRule={initialRule} />
    </div>
  );
}
