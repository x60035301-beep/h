"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Layers3, Loader2, Search, Shuffle, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import type { Locale, Script } from "@/types/crm";

const scriptCategories = [
  {
    id: "cc111111-1111-4111-8111-111111111111",
    names: { zh: "首次开发", en: "First Outreach", id: "Kontak Awal" }
  },
  {
    id: "cc222222-2222-4222-8222-222222222222",
    names: { zh: "报价跟进", en: "Quotation Follow-up", id: "Follow-up Penawaran" }
  },
  {
    id: "cc333333-3333-4333-8333-333333333333",
    names: { zh: "催单", en: "Order Push", id: "Dorong Order" }
  },
  {
    id: "cc444444-4444-4444-8444-444444444444",
    names: { zh: "客户维护", en: "Customer Care", id: "Maintenance Pelanggan" }
  },
  {
    id: "cc555555-5555-4555-8555-555555555555",
    names: { zh: "价格异议", en: "Price Objection", id: "Keberatan Harga" }
  }
] as const;

const templateTitles: Record<string, Record<Locale, string>> = {
  "bb111111-1111-4111-8111-111111111111": {
    zh: "首次开发 - 工厂介绍",
    en: "First Outreach - Factory Introduction",
    id: "Kontak Awal - Perkenalan Pabrik"
  },
  "bb111112-1111-4111-8111-111111111112": {
    zh: "首次开发 - 询问采购需求",
    en: "First Outreach - Ask Buying Needs",
    id: "Kontak Awal - Tanya Kebutuhan Pembelian"
  },
  "bb111113-1111-4111-8111-111111111113": {
    zh: "首次开发 - 展会后跟进",
    en: "First Outreach - Post-Exhibition Follow-up",
    id: "Kontak Awal - Follow-up Setelah Pameran"
  },
  "bb222221-2222-4222-8222-222222222221": {
    zh: "报价跟进 - 确认是否查看",
    en: "Quotation Follow-up - Check Review Status",
    id: "Follow-up Penawaran - Cek Apakah Sudah Dilihat"
  },
  "bb222222-2222-4222-8222-222222222222": {
    zh: "报价跟进 - 补充装柜信息",
    en: "Quotation Follow-up - Add Loading Details",
    id: "Follow-up Penawaran - Tambah Info Loading"
  },
  "bb222223-2222-4222-8222-222222222223": {
    zh: "报价跟进 - 推荐替代规格",
    en: "Quotation Follow-up - Recommend Alternative Specs",
    id: "Follow-up Penawaran - Rekomendasi Spek Alternatif"
  },
  "bb333331-3333-4333-8333-333333333331": {
    zh: "催单 - 样品反馈后推进",
    en: "Order Push - Move After Sample Feedback",
    id: "Dorong Order - Lanjut Setelah Feedback Sampel"
  },
  "bb333332-3333-4333-8333-333333333332": {
    zh: "催单 - 报价有效期提醒",
    en: "Order Push - Quote Validity Reminder",
    id: "Dorong Order - Pengingat Masa Berlaku Penawaran"
  },
  "bb333333-3333-4333-8333-333333333333": {
    zh: "催单 - 生产档期紧张",
    en: "Order Push - Tight Production Schedule",
    id: "Dorong Order - Jadwal Produksi Padat"
  },
  "bb444441-4444-4444-8444-444444444441": {
    zh: "客户维护 - 到货后关怀",
    en: "Customer Care - After Arrival Check-in",
    id: "Maintenance Pelanggan - Cek Setelah Barang Tiba"
  },
  "bb444442-4444-4444-8444-444444444442": {
    zh: "客户维护 - 复购提醒",
    en: "Customer Care - Repeat Order Reminder",
    id: "Maintenance Pelanggan - Pengingat Repeat Order"
  },
  "bb444443-4444-4444-8444-444444444443": {
    zh: "客户维护 - 新品推荐",
    en: "Customer Care - New Product Recommendation",
    id: "Maintenance Pelanggan - Rekomendasi Produk Baru"
  },
  "bb555551-5555-4555-8555-555555555551": {
    zh: "价格异议 - 强调稳定供货",
    en: "Price Objection - Emphasize Stable Supply",
    id: "Keberatan Harga - Tekankan Supply Stabil"
  },
  "bb555552-5555-4555-8555-555555555552": {
    zh: "价格异议 - 解释密度差异",
    en: "Price Objection - Explain Density Difference",
    id: "Keberatan Harga - Jelaskan Perbedaan Densitas"
  },
  "bb555553-5555-4555-8555-555555555553": {
    zh: "价格异议 - 阶梯报价",
    en: "Price Objection - Tiered Pricing",
    id: "Keberatan Harga - Harga Bertingkat"
  }
};

const tagLabels: Record<Locale, Record<string, string>> = {
  zh: {},
  en: {
    首次联系: "First contact",
    工厂介绍: "Factory intro",
    需求挖掘: "Needs discovery",
    家具: "Furniture",
    床垫: "Mattress",
    展会: "Exhibition",
    方案: "Plan",
    沙发: "Sofa",
    报价: "Quote",
    样品: "Sample",
    跟进: "Follow-up",
    装柜: "Loading",
    外贸: "Export",
    成本: "Cost",
    替代方案: "Alternative",
    降本: "Cost down",
    排期: "Schedule",
    催单: "Order push",
    有效期: "Validity",
    原料波动: "Raw material",
    订单: "Order",
    交期: "Lead time",
    订金: "Deposit",
    售后: "After-sales",
    到货: "Arrival",
    维护: "Care",
    复购: "Repeat order",
    库存: "Stock",
    老客户: "Existing customer",
    新品: "New product",
    高回弹: "HR foam",
    价格: "Price",
    谈判: "Negotiation",
    长期合作: "Long-term",
    密度: "Density",
    品质: "Quality",
    对比: "Compare",
    阶梯价: "Tiered price",
    整柜: "Full container",
    预算: "Budget"
  },
  id: {
    首次联系: "Kontak awal",
    工厂介绍: "Profil pabrik",
    需求挖掘: "Gali kebutuhan",
    家具: "Furniture",
    床垫: "Kasur",
    展会: "Pameran",
    方案: "Solusi",
    沙发: "Sofa",
    报价: "Penawaran",
    样品: "Sampel",
    跟进: "Follow-up",
    装柜: "Loading",
    外贸: "Ekspor",
    成本: "Biaya",
    替代方案: "Alternatif",
    降本: "Efisiensi biaya",
    排期: "Jadwal",
    催单: "Dorong order",
    有效期: "Masa berlaku",
    原料波动: "Bahan baku",
    订单: "Order",
    交期: "Lead time",
    订金: "Deposit",
    售后: "After-sales",
    到货: "Barang tiba",
    维护: "Maintenance",
    复购: "Repeat order",
    库存: "Stok",
    老客户: "Pelanggan lama",
    新品: "Produk baru",
    高回弹: "HR foam",
    价格: "Harga",
    谈判: "Negosiasi",
    长期合作: "Kerja sama lama",
    密度: "Densitas",
    品质: "Kualitas",
    对比: "Perbandingan",
    阶梯价: "Harga bertingkat",
    整柜: "Full container",
    预算: "Budget"
  }
};

const randomLabels: Record<
  Locale,
  {
    button: string;
    title: string;
    hint: string;
    empty: string;
    chooseCategory: string;
    count: string;
  }
> = {
  zh: {
    button: "按类别生成",
    title: "按类别生成模板",
    hint: "已根据所选类别生成多条候选话术，可直接复制使用。",
    empty: "当前类别没有可生成的模板",
    chooseCategory: "请先选择一个话术类别",
    count: "本次生成 {count} 条"
  },
  en: {
    button: "Generate by Category",
    title: "Category Template",
    hint: "Generated multiple scripts from the selected category and ready to copy.",
    empty: "No templates available in this category",
    chooseCategory: "Choose a script category first",
    count: "{count} generated"
  },
  id: {
    button: "Buat per Kategori",
    title: "Template Kategori",
    hint: "Beberapa skrip dibuat dari kategori yang dipilih dan siap disalin.",
    empty: "Tidak ada template dalam kategori ini",
    chooseCategory: "Pilih kategori skrip terlebih dahulu",
    count: "{count} dibuat"
  }
};

function getCategory(script: Script) {
  return (
    scriptCategories.find((category) => category.id === script.category_id) ??
    scriptCategories.find((category) => (Object.values(category.names) as string[]).includes(script.category_name ?? ""))
  );
}

function getCategoryLabel(script: Script, locale: Locale) {
  const category = getCategory(script);
  return category?.names[locale] ?? script.category_name ?? "";
}

function getTemplateTitle(script: Script, locale: Locale) {
  return templateTitles[script.id]?.[locale] ?? script.title;
}

function getTagLabel(tag: string, locale: Locale) {
  return tagLabels[locale][tag] ?? tag;
}

export function ScriptLibrary({ locale, scripts }: { locale: Locale; scripts: Script[] }) {
  const dictionary = getDictionary(locale);
  const copyText = dictionary.scriptLibrary;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [favorites, setFavorites] = useState(() => new Set(scripts.filter((script) => script.is_favorite).map((script) => script.id)));
  const [copied, setCopied] = useState<string | null>(null);
  const [generatedScripts, setGeneratedScripts] = useState<Script[]>([]);
  const [generating, setGenerating] = useState(false);
  const randomText = randomLabels[locale];

  const categories = useMemo(() => {
    const usedIds = new Set(scripts.map((script) => getCategory(script)?.id).filter(Boolean));
    return scriptCategories.filter((category) => usedIds.has(category.id));
  }, [scripts]);

  const filtered = useMemo(
    () =>
      scripts.filter((script) => {
        const localizedTitle = getTemplateTitle(script, locale);
        const localizedCategory = getCategoryLabel(script, locale);
        const localizedTags = script.tags.map((tag) => getTagLabel(tag, locale)).join(" ");
        const text = `${script.title} ${localizedTitle} ${localizedCategory} ${localizedTags} ${script.content_zh} ${script.content_id} ${script.tags.join(" ")}`.toLowerCase();
        const matchesQuery = text.includes(query.toLowerCase());
        const matchesCategory = category === "all" || getCategory(script)?.id === category;
        return matchesQuery && matchesCategory;
      }),
    [scripts, locale, query, category]
  );

  useEffect(() => {
    setGeneratedScripts([]);
  }, [category, query]);

  async function copyTemplate(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: copyText.copied });
    setTimeout(() => setCopied(null), 1400);
  }

  function toggleFavorite(id: string) {
    setFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generateRandomTemplate() {
    if (category === "all") {
      toast({ title: randomText.chooseCategory, variant: "destructive" });
      return;
    }

    const candidates = filtered.filter((script) => getCategory(script)?.id === category);

    if (!candidates.length) {
      toast({ title: randomText.empty, variant: "destructive" });
      return;
    }

    setGenerating(true);

    try {
      const categoryLabel = categories.find((item) => item.id === category)?.names[locale] ?? category;
      const response = await fetch("/api/ai/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, category: categoryLabel, count: 6 })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) throw new Error(payload?.error ?? randomText.empty);

      const aiScripts = Array.isArray(payload?.data?.scripts) ? payload.data.scripts : [];
      if (aiScripts.length) {
        setGeneratedScripts(
          aiScripts.map((script: Partial<Script>, index: number) => ({
            id: `ai-${category}-${Date.now()}-${index}`,
            category_id: category,
            category_name: categoryLabel,
            title: script.title ?? `${categoryLabel} ${index + 1}`,
            content_zh: script.content_zh ?? "",
            content_id: script.content_id ?? "",
            tags: Array.isArray(script.tags) ? script.tags : [categoryLabel],
            is_favorite: false
          }))
        );
        return;
      }
    } catch (error) {
      toast({ title: "AI 生成失败，已使用模板库候选", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setGenerating(false);
    }

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    setGeneratedScripts(shuffled.slice(0, Math.min(6, shuffled.length)));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <TemplateStat label={copyText.totalTemplates} value={scripts.length} />
        <TemplateStat label={copyText.favoriteTemplates} value={favorites.size} />
        <TemplateStat label={copyText.categoryCount} value={categories.length} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copyText.searchPlaceholder} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copyText.allCategories}</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.names[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={generateRandomTemplate} disabled={!scripts.length || generating} className="w-full sm:w-auto">
          {generating ? <Loader2 className="animate-spin" /> : <Shuffle />}
          {randomText.button}
        </Button>
      </div>

      {generatedScripts.length ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary">{randomText.title}</p>
              <CardTitle className="mt-1 text-base">{randomText.count.replace("{count}", String(generatedScripts.length))}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{randomText.hint}</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {generatedScripts.map((script) => (
              <div key={script.id} className="rounded-lg border bg-background p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium">{getTemplateTitle(script, locale)}</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getCategoryLabel(script, locale) ? <Badge variant="secondary">{getCategoryLabel(script, locale)}</Badge> : null}
                      {script.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {getTagLabel(tag, locale)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => toggleFavorite(script.id)} aria-label={copyText.favoriteAria}>
                    <Star className={cn(favorites.has(script.id) && "fill-amber-400 text-amber-500")} />
                  </Button>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  <ScriptBlock
                    label={copyText.chinese}
                    text={script.content_zh}
                    copied={copied === `${script.id}-random-zh`}
                    copyLabel={copyText.copy}
                    onCopy={() => copyTemplate(script.content_zh, `${script.id}-random-zh`)}
                  />
                  <ScriptBlock
                    label={copyText.indonesian}
                    text={script.content_id}
                    copied={copied === `${script.id}-random-id`}
                    copyLabel={copyText.copy}
                    onCopy={() => copyTemplate(script.content_id, `${script.id}-random-id`)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((script) => (
            <Card key={script.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{getTemplateTitle(script, locale)}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {getCategoryLabel(script, locale) ? <Badge variant="secondary">{getCategoryLabel(script, locale)}</Badge> : null}
                    {script.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {getTagLabel(tag, locale)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(script.id)} aria-label={copyText.favoriteAria}>
                  <Star className={cn(favorites.has(script.id) && "fill-amber-400 text-amber-500")} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScriptBlock
                  label={copyText.chinese}
                  text={script.content_zh}
                  copied={copied === `${script.id}-zh`}
                  copyLabel={copyText.copy}
                  onCopy={() => copyTemplate(script.content_zh, `${script.id}-zh`)}
                />
                <ScriptBlock
                  label={copyText.indonesian}
                  text={script.content_id}
                  copied={copied === `${script.id}-id`}
                  copyLabel={copyText.copy}
                  onCopy={() => copyTemplate(script.content_id, `${script.id}-id`)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card py-16 text-center text-sm text-muted-foreground">{copyText.empty}</div>
      )}
    </div>
  );
}

function TemplateStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Layers3 className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ScriptBlock({
  label,
  text,
  copied,
  copyLabel,
  onCopy
}: {
  label: string;
  text: string;
  copied: boolean;
  copyLabel: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {copied ? <Check /> : <Copy />}
          {copyLabel}
        </Button>
      </div>
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}
