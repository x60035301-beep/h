import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FollowupTaskWorkspace } from "@/components/ai-crm/followup-task-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers, getUsersByRoles } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  zh: {
    title: "跟进任务",
    description: "管理销售需要执行的客户跟进行动，区别于提醒通知。",
    back: "返回 Workflow"
  },
  en: {
    title: "Follow-up Tasks",
    description: "Manage customer follow-up actions for sales, separate from reminder notifications.",
    back: "Back to Workflow"
  },
  id: {
    title: "Task Follow-up",
    description: "Kelola aksi follow-up pelanggan untuk sales, terpisah dari notifikasi reminder.",
    back: "Kembali ke Workflow"
  }
};

export default async function FollowupTasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const [customers, assignees] = await Promise.all([getCustomers(), getUsersByRoles(["sales", "manager"])]);
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
      <FollowupTaskWorkspace locale={locale} customers={customers} assignees={assignees} />
    </div>
  );
}
