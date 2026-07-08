import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SalesReminderWorkspace } from "@/components/ai-crm/sales-reminder-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers, getUsersByRoles } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  zh: {
    title: "提醒销售",
    description: "给真实销售负责人发送内部催办提醒，推动客户跟进和报价动作。",
    back: "返回 Workflow"
  },
  en: {
    title: "Remind Sales",
    description: "Send internal reminders to real sales owners to move customer follow-up and quotation actions.",
    back: "Back to Workflow"
  },
  id: {
    title: "Ingatkan Sales",
    description: "Kirim reminder internal ke owner sales nyata agar follow-up dan quotation bergerak.",
    back: "Kembali ke Workflow"
  }
};

export default async function SalesRemindersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const [customers, salesUsers] = await Promise.all([getCustomers(), getUsersByRoles(["sales"])]);
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
      <SalesReminderWorkspace locale={locale} customers={customers} salesUsers={salesUsers} />
    </div>
  );
}
