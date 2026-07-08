"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressLine } from "@/components/ai-crm/progress-line";
import { toast } from "@/hooks/use-toast";
import type { Locale } from "@/types/crm";

type Recommendation = {
  productType: string;
  recommendedSpec: string;
  suggestedQuote: string;
  confidence: number;
  questions: string[];
  nextSteps: string[];
};

const copy = {
  zh: { title: "AI 询盘推荐", run: "AI 重新分析", loading: "分析中", failed: "AI 询盘分析失败", product: "产品识别", spec: "推荐规格", quote: "报价方向", questions: "需确认问题", steps: "下一步" },
  en: { title: "AI inquiry recommendation", run: "Analyze again", loading: "Analyzing", failed: "AI inquiry analysis failed", product: "Product", spec: "Recommended spec", quote: "Quote direction", questions: "Questions", steps: "Next steps" },
  id: { title: "Rekomendasi inquiry AI", run: "Analisis ulang", loading: "Menganalisis", failed: "Analisis inquiry AI gagal", product: "Produk", spec: "Spek rekomendasi", quote: "Arah harga", questions: "Pertanyaan", steps: "Langkah berikutnya" }
} as const;

export function InquiryAiPanel({ locale, inquiry }: { locale: Locale; inquiry: Record<string, unknown> }) {
  const page = copy[locale];
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  async function analyze() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/inquiry-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, inquiry })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? page.failed);
      setRecommendation(payload.data.recommendation);
    } catch (error) {
      toast({ title: page.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            {page.title}
          </CardTitle>
          <Button type="button" variant="outline" onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? page.loading : page.run}
          </Button>
        </div>
      </CardHeader>
      {recommendation ? (
        <CardContent className="space-y-4">
          <ProgressLine value={recommendation.confidence} label={`${page.title} ${recommendation.confidence}%`} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label={page.product} value={recommendation.productType} />
            <Info label={page.spec} value={recommendation.recommendedSpec} />
            <Info label={page.quote} value={recommendation.suggestedQuote} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <List title={page.questions} items={recommendation.questions} />
            <List title={page.steps} items={recommendation.nextSteps} />
          </div>
        </CardContent>
      ) : null}
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

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <p className="mb-2 font-medium">{title}</p>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
