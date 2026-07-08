import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileImage, FileText, Sparkles, Video } from "lucide-react";

import { InquiryAiPanel } from "@/components/ai-crm/inquiry-ai-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, inquiryRecords, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { back: "返回询盘管理", budget: "客户预算", purchaseTime: "预计采购时间", competitor: "竞争对手", aiKind: "AI 识别", aiSpec: "推荐规格", aiQuote: "推荐报价", attachments: "上传附件", customer360: "进入客户详情", source: "询盘来源" },
  en: { back: "Back to inquiries", budget: "Budget", purchaseTime: "Purchase time", competitor: "Competitor", aiKind: "AI recognition", aiSpec: "Recommended spec", aiQuote: "Suggested quote", attachments: "Uploaded files", customer360: "Open customer detail", source: "Inquiry source" },
  id: { back: "Kembali ke inquiry", budget: "Budget", purchaseTime: "Waktu beli", competitor: "Kompetitor", aiKind: "AI recognition", aiSpec: "Spesifikasi rekomendasi", aiQuote: "Harga rekomendasi", attachments: "File upload", customer360: "Buka detail pelanggan", source: "Sumber inquiry" }
} as const;

const fileIcons = {
  image: FileImage,
  video: Video,
  PDF: FileText,
  CAD: FileText
} as const;

export default async function InquiryDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const inquiryId = decodeURIComponent(id);
  const inquiry = inquiryRecords.find((item) => item.id === inquiryId);
  if (!inquiry) notFound();

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/inquiries`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader
        title={inquiry.id}
        description={`${inquiry.customer} · ${inquiry.product}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/${locale}/customers/11111111-1111-4111-8111-111111111111`}>{page.customer360}</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Summary label={page.budget} value={inquiry.budget} />
        <Summary label={page.purchaseTime} value={inquiry.purchaseTime} />
        <Summary label={page.competitor} value={inquiry.competitor} />
        <Summary label={page.source} value="Website / WhatsApp" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle>{copy.common.aiReserved}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Info label={page.aiKind} value={text(inquiry.aiKind, locale)} />
            <Info label={page.aiSpec} value={inquiry.aiSpec} />
            <Info label={page.aiQuote} value={inquiry.aiQuote} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.attachments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiry.files.map((file) => {
              const Icon = fileIcons[file];

              return (
                <div key={file} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    {file}
                  </span>
                  <Badge variant="secondary">v1</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <InquiryAiPanel locale={locale} inquiry={inquiry} />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 break-words text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
