import Link from "next/link";
import { FileImage, FileText, Sparkles, Video } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, inquiryRecords, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { budget: "客户预算", purchaseTime: "预计采购时间", competitor: "竞争对手", aiKind: "AI 识别", aiSpec: "推荐规格", aiQuote: "推荐报价", attachments: "附件" },
  en: { budget: "Budget", purchaseTime: "Purchase time", competitor: "Competitor", aiKind: "AI recognition", aiSpec: "Recommended spec", aiQuote: "Suggested quote", attachments: "Files" },
  id: { budget: "Budget", purchaseTime: "Waktu beli", competitor: "Kompetitor", aiKind: "AI recognition", aiSpec: "Spesifikasi rekomendasi", aiQuote: "Harga rekomendasi", attachments: "File" }
} as const;

const fileIcons = {
  image: FileImage,
  video: Video,
  PDF: FileText,
  CAD: FileText
} as const;

export default async function InquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.inquiries.title} description={copy.pages.inquiries.description} />

      <section className="grid gap-4 xl:grid-cols-2">
        {inquiryRecords.map((inquiry) => (
          <Link key={inquiry.id} href={`/${locale}/inquiries/${encodeURIComponent(inquiry.id)}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition hover:border-primary/40 hover:shadow-soft">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{inquiry.id}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{inquiry.customer}</p>
                  </div>
                  <Badge variant="secondary">{inquiry.product}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Info label={page.budget} value={inquiry.budget} />
                  <Info label={page.purchaseTime} value={inquiry.purchaseTime} />
                  <Info label={page.competitor} value={inquiry.competitor} />
                </div>
                <div className="rounded-md border p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <p className="font-medium">{copy.common.aiReserved}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Info label={page.aiKind} value={text(inquiry.aiKind, locale)} />
                    <Info label={page.aiSpec} value={inquiry.aiSpec} />
                    <Info label={page.aiQuote} value={inquiry.aiQuote} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">{page.attachments}</span>
                  {inquiry.files.map((file) => {
                    const Icon = fileIcons[file];
                    return (
                      <Badge key={file} variant="outline" className="gap-1">
                        <Icon className="size-3" />
                        {file}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
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
