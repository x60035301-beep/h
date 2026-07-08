"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Search, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { aiCrmCopy, knowledgeItems, text } from "@/data/ai-crm";
import type { Locale } from "@/types/crm";

type KnowledgeAnswer = {
  answer: string;
  references: string[];
  suggestedActions: string[];
};

const askCopy = {
  zh: { title: "AI 知识库问答", placeholder: "例如：客户问 30D 海绵为什么比别人贵，怎么回复？", button: "问 AI", empty: "请输入问题", failed: "AI 问答失败", references: "引用", actions: "建议动作", noItems: "暂无知识库条目", noItemsDescription: "添加产品知识、报价模板、物流、售后和 FAQ 后，AI 才能引用真实内容回答。" },
  en: { title: "AI Knowledge Q&A", placeholder: "Example: how should I reply when a customer asks why 30D foam is more expensive?", button: "Ask AI", empty: "Enter a question", failed: "AI answer failed", references: "References", actions: "Suggested actions" },
  id: { title: "Tanya Knowledge AI", placeholder: "Contoh: bagaimana menjawab customer yang tanya kenapa spons 30D lebih mahal?", button: "Tanya AI", empty: "Tulis pertanyaan", failed: "Jawaban AI gagal", references: "Referensi", actions: "Aksi disarankan" }
} as const;

export function KnowledgeSearch({ locale }: { locale: Locale }) {
  const copy = aiCrmCopy[locale].knowledge;
  const aiText = askCopy[locale];
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<KnowledgeAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const normalized = query.trim().toLowerCase();
  const items = useMemo(
    () =>
      knowledgeItems.filter((item) => {
        if (!normalized) return true;
        return [text(item.category, locale), item.title, item.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      }),
    [locale, normalized]
  );

  async function askAi() {
    const nextQuestion = question.trim() || query.trim();
    if (!nextQuestion) {
      toast({ title: aiText.empty, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/knowledge-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, question: nextQuestion })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? aiText.failed);
      setAnswer(payload.data.result);
    } catch (error) {
      toast({ title: aiText.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder={copy.searchPlaceholder} />
      </div>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            {aiText.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={aiText.placeholder} className="min-h-20" />
          <Button type="button" onClick={askAi} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {aiText.button}
          </Button>
          {answer ? (
            <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm">
              <p className="leading-6">{answer.answer}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoList title={aiText.references} items={answer.references} />
                <InfoList title={aiText.actions} items={answer.suggestedActions} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <Link
              key={`${item.category.en}-${item.title}`}
              href={`/${locale}/knowledge-base/${encodeURIComponent(item.title)}`}
              className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition hover:border-primary/40 hover:shadow-soft">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <BookOpen className="size-4" />
                      </span>
                      <div>
                        <CardTitle className="text-sm">{item.title}</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">{text(item.category, locale)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{copy.aiReady}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">{item.updated}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={"noItems" in aiText ? aiText.noItems : "No knowledge articles"}
          description={"noItemsDescription" in aiText ? aiText.noItemsDescription : "Add real knowledge articles before using AI references."}
        />
      )}
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
