import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Database, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, knowledgeItems, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: {
    back: "返回知识库",
    updated: "更新时间",
    category: "分类",
    aiUse: "AI 引用方式",
    content: "知识内容",
    version: "版本记录",
    body1: "该条目会作为 HOMY 销售、报价、生产、物流和售后团队可复用的企业知识保存。V2 后端可将内容索引用于 RAG 检索。",
    body2: "生成销售回复、报价邮件、产品推荐、Workflow 说明和客户分析报告时，可以引用这条知识。"
  },
  en: {
    back: "Back to knowledge base",
    updated: "Updated",
    category: "Category",
    aiUse: "AI usage",
    content: "Knowledge content",
    version: "Version history",
    body1: "This article is stored as reusable enterprise knowledge for HOMY sales, quotation, production, logistics, and after-sales teams. The V2 backend can index it for RAG retrieval.",
    body2: "Use this article when generating sales replies, quotation emails, product recommendations, workflow explanations, and customer analysis reports."
  },
  id: {
    back: "Kembali ke knowledge base",
    updated: "Diperbarui",
    category: "Kategori",
    aiUse: "Penggunaan AI",
    content: "Isi knowledge",
    version: "Riwayat versi",
    body1: "Artikel ini disimpan sebagai knowledge perusahaan yang dapat digunakan oleh tim sales, penawaran, produksi, logistik, dan after sales HOMY. Backend V2 dapat mengindeksnya untuk RAG.",
    body2: "Gunakan artikel ini saat membuat balasan sales, email penawaran, rekomendasi produk, penjelasan workflow, dan laporan analisis pelanggan."
  }
} as const;

export default async function KnowledgeDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const title = decodeURIComponent(slug);
  const item = knowledgeItems.find((knowledge) => knowledge.title === title);
  if (!item) notFound();

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/knowledge-base`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader
        title={item.title}
        description={`${text(item.category, locale)} · ${page.updated}: ${item.updated}`}
        actions={<Badge variant="secondary">{copy.knowledge.aiReady}</Badge>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Summary icon={<BookOpen className="size-4" />} label={page.category} value={text(item.category, locale)} />
        <Summary icon={<Clock className="size-4" />} label={page.updated} value={item.updated} />
        <Summary icon={<Database className="size-4" />} label={page.aiUse} value={copy.common.aiReserved} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>{page.content}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>{page.body1}</p>
            <p>{page.body2}</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.version}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["v1.2", "v1.1", "v1.0"].map((version, index) => (
              <div key={version} className="flex items-start gap-3 rounded-md border p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="font-medium">{version}</p>
                  <p className="mt-1 text-xs text-muted-foreground">2026-07-0{2 - index}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <span className="mb-3 flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">{icon}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 break-words text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
