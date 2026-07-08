import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EmailCenterWorkspace } from "@/components/ai-crm/email-center-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  zh: {
    title: "邮件中心",
    description: "编辑并发送欢迎邮件、报价跟进和样品确认邮件。",
    back: "返回 Workflow"
  },
  en: {
    title: "Email Center",
    description: "Edit and send welcome, quotation follow-up, and sample confirmation emails.",
    back: "Back to Workflow"
  },
  id: {
    title: "Email Center",
    description: "Edit dan kirim email welcome, follow-up penawaran, dan konfirmasi sample.",
    back: "Kembali ke Workflow"
  }
};

export default async function EmailCenterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
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
      <EmailCenterWorkspace locale={locale} customers={customers} />
    </div>
  );
}
