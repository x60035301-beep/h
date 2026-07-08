"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import type { Locale } from "@/types/crm";

type Analysis = {
  score: number;
  winProbability: number;
  churnRisk: number;
  valueLevel: string;
  recommendedFollowUpTime: string;
  summary: string;
  strategy: string;
  report: string[];
};

const copy = {
  zh: { title: "AI 实时客户分析", run: "AI 重新分析", loading: "分析中", failed: "AI 客户分析失败", score: "评分", probability: "成交概率", risk: "流失风险", value: "客户价值", next: "建议跟进", summary: "总结", strategy: "策略", report: "报告" },
  en: { title: "Live AI customer analysis", run: "Analyze again", loading: "Analyzing", failed: "AI customer analysis failed", score: "Score", probability: "Win probability", risk: "Churn risk", value: "Value", next: "Follow-up", summary: "Summary", strategy: "Strategy", report: "Report" },
  id: { title: "Analisis pelanggan AI", run: "Analisis ulang", loading: "Menganalisis", failed: "Analisis pelanggan AI gagal", score: "Skor", probability: "Peluang deal", risk: "Risiko churn", value: "Nilai", next: "Follow-up", summary: "Ringkasan", strategy: "Strategi", report: "Laporan" }
} as const;

export function CustomerAiPanel({ locale, customer }: { locale: Locale; customer: Record<string, unknown> }) {
  const page = copy[locale];
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function analyze() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/customer-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, customer })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? page.failed);
      setAnalysis(payload.data.analysis);
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
      {analysis ? (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ProgressLine value={analysis.score} label={`${page.score} ${analysis.score}/100`} />
            <ProgressLine value={analysis.winProbability} label={`${page.probability} ${analysis.winProbability}%`} />
            <ProgressLine value={analysis.churnRisk} label={`${page.risk} ${analysis.churnRisk}%`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{page.value}: {analysis.valueLevel}</Badge>
            <Badge variant="outline">{page.next}: {analysis.recommendedFollowUpTime}</Badge>
          </div>
          <Info title={page.summary} text={analysis.summary} />
          <Info title={page.strategy} text={analysis.strategy} />
          <div className="grid gap-2">
            <p className="font-medium">{page.report}</p>
            {analysis.report.map((item) => (
              <div key={item} className="rounded-md border p-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <p className="mb-2 font-medium">{title}</p>
      <p className="leading-6">{text}</p>
    </div>
  );
}
