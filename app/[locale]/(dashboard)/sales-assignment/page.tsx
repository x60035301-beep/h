import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SalesAssignmentWorkspace } from "@/components/ai-crm/sales-assignment-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers, getUsersByRoles } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  zh: {
    title: "销售分配",
    description: "把新询盘和待跟进客户分配给真实销售账号，支持规则自动分配和手动调整。",
    back: "返回 Workflow"
  },
  en: {
    title: "Sales Assignment",
    description: "Assign new inquiries and follow-up customers to real sales users with rules or manual control.",
    back: "Back to Workflow"
  },
  id: {
    title: "Sales Assignment",
    description: "Assign inquiry baru dan pelanggan follow-up ke user sales nyata dengan aturan atau kontrol manual.",
    back: "Kembali ke Workflow"
  }
};

export default async function SalesAssignmentPage({ params }: { params: Promise<{ locale: string }> }) {
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
      <SalesAssignmentWorkspace locale={locale} customers={customers} salesUsers={salesUsers} />
    </div>
  );
}
