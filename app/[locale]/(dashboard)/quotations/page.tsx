import { Calculator, FileSpreadsheet, FileText, ShieldCheck, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { QuotationList } from "@/components/quotations/quotation-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy } from "@/data/ai-crm";
import { getCustomers, getProducts, getQuotations } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

const quoteCopy = {
  zh: {
    title: "AI 报价试算",
    description: "输入产品、密度、尺寸和数量后，可接入真实成本模型自动计算。",
    material: "材料成本",
    labor: "人工成本",
    packing: "包装成本",
    freight: "运费",
    profit: "利润",
    suggested: "建议售价",
    floor: "最低售价",
    approval: "审批流程",
    outputs: "PDF / Excel / PI / Invoice 已预留"
  },
  en: {
    title: "AI quote estimator",
    description: "Connect a real cost model after product, density, size, and quantity are entered.",
    material: "Material cost",
    labor: "Labor cost",
    packing: "Packing cost",
    freight: "Freight",
    profit: "Profit",
    suggested: "Suggested price",
    floor: "Floor price",
    approval: "Approval flow",
    outputs: "PDF / Excel / PI / Invoice reserved"
  },
  id: {
    title: "Estimator penawaran AI",
    description: "Hubungkan model biaya nyata setelah produk, density, ukuran, dan quantity diisi.",
    material: "Biaya material",
    labor: "Biaya tenaga kerja",
    packing: "Biaya packing",
    freight: "Ongkir",
    profit: "Profit",
    suggested: "Harga rekomendasi",
    floor: "Harga minimum",
    approval: "Approval flow",
    outputs: "PDF / Excel / PI / Invoice disiapkan"
  }
} as const;

export default async function QuotationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const aiCopy = aiCrmCopy[locale];
  const quote = quoteCopy[locale];
  const [quotations, customers, products] = await Promise.all([getQuotations(), getCustomers(), getProducts()]);

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.quotations.title} description={dictionary.pages.quotations.description} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{quote.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{quote.description}</p>
            </div>
            <Badge variant="outline">{aiCopy.common.aiReserved}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <QuoteMetric icon={Calculator} label={quote.material} value={formatCurrency(8120)} />
          <QuoteMetric icon={Calculator} label={quote.labor} value={formatCurrency(940)} />
          <QuoteMetric icon={Calculator} label={quote.packing} value={formatCurrency(680)} />
          <QuoteMetric icon={Calculator} label={quote.freight} value={formatCurrency(1850)} />
          <QuoteMetric icon={ShieldCheck} label={quote.profit} value="23%" />
          <QuoteMetric icon={FileText} label={quote.suggested} value={formatCurrency(12850)} />
          <QuoteMetric icon={FileText} label={quote.floor} value={formatCurrency(11690)} />
          <QuoteMetric icon={FileSpreadsheet} label={quote.approval} value={quote.outputs} />
        </CardContent>
      </Card>
      <QuotationList locale={locale} quotations={quotations} customers={customers} products={products} />
    </div>
  );
}

function QuoteMetric({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <Icon className="mb-3 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
