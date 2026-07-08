import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ManagerEscalationWorkspace } from "@/components/ai-crm/manager-escalation-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers, getUsersByRoles } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  zh: {
    title: "经理升级提醒",
    description: "集中处理需要经理介入的客户：超时未报价、价格卡住、高价值客户和样品风险。",
    back: "返回 Workflow"
  },
  en: {
    title: "Manager Escalation",
    description: "Handle customers that need manager help: overdue quotes, price blockers, high-value accounts, and sample risks.",
    back: "Back to Workflow"
  },
  id: {
    title: "Eskalasi Manager",
    description: "Tangani customer yang perlu bantuan manager: quote overdue, harga macet, high-value account, dan risiko sample.",
    back: "Kembali ke Workflow"
  }
};

export default async function ManagerEscalationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const [customers, managerUsers] = await Promise.all([getCustomers(), getUsersByRoles(["admin", "boss", "manager"])]);
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
      <ManagerEscalationWorkspace locale={locale} customers={customers} managerUsers={managerUsers} />
    </div>
  );
}
