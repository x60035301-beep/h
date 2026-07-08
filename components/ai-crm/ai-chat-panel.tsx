"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Check, Copy, Loader2, RotateCcw, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { aiCrmCopy } from "@/data/ai-crm";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/crm";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const prompts = {
  zh: ["客户一直压价怎么办？", "生成英文报价邮件", "生成 WhatsApp 印尼语回复", "客户 3 天没回复，帮我写催单话术"],
  en: ["How do I handle price pressure?", "Generate an English quotation email", "Write a WhatsApp reply in Bahasa Indonesia", "Write a follow-up message after 3 days"],
  id: ["Bagaimana menangani pelanggan yang menekan harga?", "Buat email penawaran bahasa Inggris", "Buat balasan WhatsApp bahasa Indonesia", "Buat follow-up setelah 3 hari"]
} as const;

const workflowPrompts = {
  "welcome-email": {
    zh: "生成一封客户创建后的欢迎邮件，说明 HOMY 可以提供海绵产品、打样、报价和长期供货支持。",
    en: "Generate a welcome email after a customer is created. Mention HOMY foam products, sampling, quotation, and long-term supply support.",
    id: "Buat email welcome setelah pelanggan dibuat. Sebutkan produk foam HOMY, sample, penawaran, dan dukungan supply jangka panjang."
  }
} as const;

const localCopy = {
  zh: {
    title: "HOMY AI",
    empty: "请输入销售问题后生成回复。",
    copy: "复制",
    copied: "已复制",
    reset: "清空",
    failed: "生成失败",
    firstReply: "您好，我是 HOMY 本地销售助手。可以帮你生成压价处理、报价邮件、WhatsApp 回复和跟进话术。",
    inputMissing: "请先输入问题"
  },
  en: {
    title: "HOMY AI",
    empty: "Enter a sales question to generate a reply.",
    copy: "Copy",
    copied: "Copied",
    reset: "Clear",
    failed: "Generation failed",
    firstReply: "Hi, I am the HOMY local sales assistant. I can draft price negotiation replies, quotation emails, WhatsApp messages, and follow-ups.",
    inputMissing: "Please enter a question first"
  },
  id: {
    title: "HOMY AI",
    empty: "Tulis pertanyaan sales untuk membuat balasan.",
    copy: "Salin",
    copied: "Disalin",
    reset: "Hapus",
    failed: "Gagal membuat balasan",
    firstReply: "Halo, saya asisten sales lokal HOMY. Saya bisa bantu membuat balasan negosiasi harga, email penawaran, WhatsApp, dan follow-up.",
    inputMissing: "Tulis pertanyaan terlebih dahulu"
  }
} as const;

export function AiChatPanel({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const copy = aiCrmCopy[locale].aiChat;
  const ui = localCopy[locale];
  const [message, setMessage] = useState<string>(prompts[locale][0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: ui.firstReply
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const conversationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && prompt in workflowPrompts) {
      setMessage(workflowPrompts[prompt as keyof typeof workflowPrompts][locale]);
    }
  }, [locale, searchParams]);

  async function generateReply(nextMessage = message) {
    const content = nextMessage.trim();
    if (!content) {
      toast({ title: ui.inputMissing, variant: "destructive" });
      return;
    }

    const userMessage: ChatMessage = {
      id: globalThis.crypto.randomUUID(),
      role: "user",
      content
    };

    setLoading(true);
    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, message: content })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? ui.failed);
      }

      setMessages((current) => [
        ...current,
        {
          id: globalThis.crypto.randomUUID(),
          role: "assistant",
          content: payload.data.reply
        }
      ]);
      setMessage("");
    } catch (error) {
      toast({ title: ui.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      setMessages((current) => current.filter((item) => item.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  }

  async function copyReply(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: ui.copied });
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function resetChat() {
    setMessages([{ id: "welcome", role: "assistant", content: ui.firstReply }]);
    setMessage(prompts[locale][0]);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{copy.promptLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {prompts[locale].map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant={message === prompt ? "default" : "outline"}
              className="h-auto w-full justify-start whitespace-normal text-left"
              onClick={() => setMessage(prompt)}
            >
              <Sparkles className="size-4 shrink-0" />
              <span>{prompt}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="min-h-[560px]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </span>
            <CardTitle>{ui.title}</CardTitle>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={resetChat}>
            <RotateCcw className="size-4" />
            {ui.reset}
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-[460px] flex-col gap-4">
          <div ref={conversationRef} className="flex max-h-[320px] min-h-[260px] flex-col gap-3 overflow-y-auto rounded-lg border bg-muted/20 p-3">
            {messages.length ? (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex max-w-[86%] flex-col gap-2 rounded-md p-3 text-sm leading-6",
                    item.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-background shadow-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap">{item.content}</div>
                  {item.role === "assistant" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-fit px-2 text-xs"
                      onClick={() => copyReply(item.id, item.content)}
                    >
                      {copiedId === item.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copiedId === item.id ? ui.copied : ui.copy}
                    </Button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">{ui.empty}</div>
            )}
            {loading ? (
              <div className="flex w-fit items-center gap-2 rounded-md bg-background p-3 text-sm shadow-sm">
                <Loader2 className="size-4 animate-spin" />
                {copy.send}
              </div>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <Textarea
              className="min-h-28 resize-none"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={copy.inputPlaceholder}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  void generateReply();
                }
              }}
            />
            <Button className="self-end" onClick={() => generateReply()} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {copy.send}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
