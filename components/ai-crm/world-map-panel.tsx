"use client";

import { useMemo, useState } from "react";
import { Globe2, MapPin } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { worldMapCountries } from "@/data/ai-crm";
import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/types/crm";

const labels = {
  zh: { customers: "客户数量", orders: "订单数量", sales: "销售额", rate: "成交率", ranking: "国家排行", empty: "暂无国家数据", emptyDescription: "添加真实客户国家和订单后，世界地图会自动显示国家分布和销售数据。" },
  en: { customers: "Customers", orders: "Orders", sales: "Sales", rate: "Conversion", ranking: "Country ranking", empty: "No country data", emptyDescription: "Add real customer countries and orders to populate the world map." },
  id: { customers: "Pelanggan", orders: "Order", sales: "Sales", rate: "Konversi", ranking: "Ranking negara", empty: "Belum ada data negara", emptyDescription: "Tambahkan negara pelanggan dan order nyata untuk mengisi peta dunia." }
} as const;

export function WorldMapPanel({ locale }: { locale: Locale }) {
  const [selectedCode, setSelectedCode] = useState<string>(() => worldMapCountries[0]?.code ?? "");
  const copy = labels[locale];
  const selected = useMemo(
    () => worldMapCountries.find((country) => country.code === selectedCode) ?? worldMapCountries[0] ?? null,
    [selectedCode]
  );

  if (!selected) {
    return <EmptyState icon={Globe2} title={copy.empty} description={copy.emptyDescription} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{copy.ranking}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[460px] overflow-hidden rounded-md border bg-[radial-gradient(circle_at_30%_30%,hsl(var(--accent)),transparent_32%),linear-gradient(135deg,hsl(var(--muted)),transparent)]">
            <div className="absolute inset-8 rounded-full border border-dashed border-border/80" />
            <div className="absolute inset-x-12 top-1/2 h-px bg-border" />
            <div className="absolute inset-y-12 left-1/2 w-px bg-border" />
            {worldMapCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => setSelectedCode(country.code)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-xs shadow-sm transition hover:border-primary hover:text-primary"
                style={{ left: `${country.x}%`, top: `${country.y}%` }}
                aria-pressed={selectedCode === country.code}
              >
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {country.code}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{selected.name}</CardTitle>
            <Badge variant="secondary">{selected.code}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CountryMetric label={copy.customers} value={selected.customers.toString()} />
          <CountryMetric label={copy.orders} value={selected.orders.toString()} />
          <CountryMetric label={copy.sales} value={formatCurrency(selected.sales)} />
          <CountryMetric label={copy.rate} value={`${selected.rate}%`} />
        </CardContent>
      </Card>
    </div>
  );
}

function CountryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
