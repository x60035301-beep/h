"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Send, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { CustomerSummary, Locale } from "@/types/crm";

type TemplateKey = "welcome" | "quote_followup" | "sample_confirm";

const copy = {
  zh: {
    title: "邮件发送",
    subtitle: "为客户发送欢迎邮件、报价跟进和样品确认邮件。",
    customer: "客户",
    template: "邮件模板",
    to: "收件人",
    subject: "主题",
    body: "正文",
    preview: "邮件预览",
    send: "发送邮件",
    sent: "邮件已发送",
    aiReady: "可接入 AI 生成",
    noEmail: "该客户没有邮箱，请先补充客户资料。",
    welcome: "欢迎邮件",
    quoteFollowup: "报价跟进",
    sampleConfirm: "样品确认"
  },
  en: {
    title: "Email Center",
    subtitle: "Send welcome emails, quotation follow-ups, and sample confirmation emails to customers.",
    customer: "Customer",
    template: "Email template",
    to: "Recipient",
    subject: "Subject",
    body: "Body",
    preview: "Email preview",
    send: "Send email",
    sent: "Email sent",
    aiReady: "AI generation ready",
    noEmail: "This customer has no email. Update the customer profile first.",
    welcome: "Welcome email",
    quoteFollowup: "Quotation follow-up",
    sampleConfirm: "Sample confirmation"
  },
  id: {
    title: "Email Center",
    subtitle: "Kirim email welcome, follow-up penawaran, dan konfirmasi sample ke pelanggan.",
    customer: "Pelanggan",
    template: "Template email",
    to: "Penerima",
    subject: "Subjek",
    body: "Isi email",
    preview: "Preview email",
    send: "Kirim email",
    sent: "Email terkirim",
    aiReady: "Siap AI generation",
    noEmail: "Pelanggan ini belum punya email. Lengkapi profil pelanggan dulu.",
    welcome: "Email welcome",
    quoteFollowup: "Follow-up penawaran",
    sampleConfirm: "Konfirmasi sample"
  }
} as const;

const templateLabels: Record<TemplateKey, keyof typeof copy.zh> = {
  welcome: "welcome",
  quote_followup: "quoteFollowup",
  sample_confirm: "sampleConfirm"
};

export function EmailCenterWorkspace({ locale, customers }: { locale: Locale; customers: CustomerSummary[] }) {
  const searchParams = useSearchParams();
  const page = copy[locale];
  const customerOptions = useMemo(() => customers.filter((customer) => customer.email).slice(0, 12), [customers]);
  const fallbackCustomer = customerOptions[0] ?? customers[0];
  const [customerId, setCustomerId] = useState(fallbackCustomer?.id ?? "");
  const [template, setTemplate] = useState<TemplateKey>("welcome");
  const selectedCustomer = customers.find((customer) => customer.id === customerId) ?? fallbackCustomer;
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(null);

  useEffect(() => {
    const requestedTemplate = searchParams.get("template");
    if (requestedTemplate === "welcome" || requestedTemplate === "quote_followup" || requestedTemplate === "sample_confirm") {
      setTemplate(requestedTemplate);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCustomer) return;
    const next = buildTemplate(template, selectedCustomer, locale);
    setSubject(next.subject);
    setBody(next.body);
    setSentAt(null);
  }, [locale, selectedCustomer, template]);

  async function sendEmail() {
    if (!selectedCustomer?.email) {
      toast({ title: page.noEmail, variant: "destructive" });
      return;
    }

    setLoading(true);
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: selectedCustomer.id,
        to: selectedCustomer.email,
        subject,
        body,
        template
      })
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast({ title: "Send failed", description: payload?.error, variant: "destructive" });
      return;
    }

    setSentAt(new Date().toISOString());
    toast({ title: page.sent });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{page.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
          </div>
          <Badge variant="outline">
            <Sparkles className="mr-1 size-3" />
            {page.aiReady}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>{page.customer}</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(customerOptions.length ? customerOptions : customers).map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{page.template}</Label>
              <Select value={template} onValueChange={(value) => setTemplate(value as TemplateKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(templateLabels) as TemplateKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {page[templateLabels[key]]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>{page.to}</Label>
            <Input value={selectedCustomer?.email ?? ""} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>{page.subject}</Label>
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{page.body}</Label>
            <Textarea className="min-h-72 resize-y" value={body} onChange={(event) => setBody(event.target.value)} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {sentAt ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Mail className="size-4" />}
              {sentAt ? page.sent : selectedCustomer?.email ?? page.noEmail}
            </div>
            <Button type="button" onClick={sendEmail} disabled={loading || !selectedCustomer?.email}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {page.send}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{page.preview}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-background p-4 shadow-sm">
            <div className="border-b pb-3">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="mt-1 text-sm font-medium">{selectedCustomer?.email ?? "-"}</p>
              <p className="mt-3 text-xs text-muted-foreground">Subject</p>
              <p className="mt-1 font-semibold">{subject}</p>
            </div>
            <div className="whitespace-pre-wrap pt-4 text-sm leading-6">{body}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildTemplate(template: TemplateKey, customer: CustomerSummary, locale: Locale) {
  const company = customer.company_name;
  const contact = customer.contact_name ?? (locale === "zh" ? "您好" : locale === "id" ? "Bapak/Ibu" : "Customer");

  if (template === "quote_followup") {
    if (locale === "en") {
      return {
        subject: `Follow-up on HOMY quotation for ${company}`,
        body: `Dear ${contact},\n\nI hope you are doing well. I wanted to follow up on the quotation and foam specification we shared with you.\n\nIf the direction is suitable, HOMY can help prepare samples first so your team can confirm density, softness, cutting quality, and packing before bulk order.\n\nPlease let us know if you need any adjustment on size, density, quantity, or delivery schedule.\n\nBest regards,\nHOMY Sales Team`
      };
    }
    if (locale === "id") {
      return {
        subject: `Follow-up penawaran HOMY untuk ${company}`,
        body: `Halo ${contact},\n\nKami ingin follow up penawaran dan spesifikasi foam yang sudah kami kirim.\n\nJika arahnya cocok, HOMY bisa bantu siapkan sample terlebih dahulu agar tim Bapak/Ibu dapat konfirmasi density, softness, kualitas cutting, dan packing sebelum order besar.\n\nSilakan informasikan jika perlu penyesuaian ukuran, density, quantity, atau jadwal pengiriman.\n\nSalam,\nHOMY Sales Team`
      };
    }
    return {
      subject: `HOMY 报价跟进 - ${company}`,
      body: `${contact}，您好：\n\n想跟进一下我们之前发送的海绵报价和规格资料。\n\n如果方向合适，HOMY 可以先安排样品，让贵司确认密度、手感、切割质量和包装方式，再推进大货订单。\n\n如需调整尺寸、密度、数量或交期，请直接告诉我们。\n\nHOMY 销售团队`
    };
  }

  if (template === "sample_confirm") {
    if (locale === "en") {
      return {
        subject: `Sample confirmation from HOMY - ${company}`,
        body: `Dear ${contact},\n\nThank you for your interest in HOMY foam products.\n\nWe can prepare samples based on your required density, size, and application. Please confirm the preferred foam type, thickness, quantity, and delivery address so we can arrange the sample plan.\n\nBest regards,\nHOMY Sales Team`
      };
    }
    if (locale === "id") {
      return {
        subject: `Konfirmasi sample HOMY - ${company}`,
        body: `Halo ${contact},\n\nTerima kasih atas minat Bapak/Ibu pada produk foam HOMY.\n\nKami dapat menyiapkan sample sesuai density, ukuran, dan aplikasi yang dibutuhkan. Mohon konfirmasi jenis foam, ketebalan, quantity, dan alamat pengiriman agar kami bisa atur sample.\n\nSalam,\nHOMY Sales Team`
      };
    }
    return {
      subject: `HOMY 样品确认 - ${company}`,
      body: `${contact}，您好：\n\n感谢您关注 HOMY 海绵产品。\n\n我们可以按照贵司需要的密度、尺寸和使用场景准备样品。请确认海绵类型、厚度、数量和收件地址，我们会安排样品计划。\n\nHOMY 销售团队`
    };
  }

  if (locale === "en") {
    return {
      subject: `Welcome to HOMY - Foam products and quotation support`,
      body: `Dear ${contact},\n\nThank you for connecting with HOMY.\n\nHOMY is a foam factory in Indonesia. We can support foam products for sofa, mattress, packaging, and industrial applications, including product recommendation, sampling, quotation, and long-term supply.\n\nTo prepare a suitable proposal, please share your required foam type, density, size, quantity, and target application. Our sales team will follow up with the best product option and quotation.\n\nBest regards,\nHOMY Sales Team`
    };
  }

  if (locale === "id") {
    return {
      subject: `Selamat datang di HOMY - Dukungan produk foam dan penawaran`,
      body: `Halo ${contact},\n\nTerima kasih sudah terhubung dengan HOMY.\n\nHOMY adalah pabrik foam di Indonesia. Kami dapat mendukung kebutuhan foam untuk sofa, mattress, packaging, dan aplikasi industri, termasuk rekomendasi produk, sample, penawaran, dan supply jangka panjang.\n\nUntuk menyiapkan proposal yang sesuai, mohon kirim jenis foam, density, ukuran, quantity, dan aplikasi penggunaan. Tim sales kami akan follow up dengan opsi produk dan penawaran terbaik.\n\nSalam,\nHOMY Sales Team`
    };
  }

  return {
    subject: `欢迎联系 HOMY - 海绵产品与报价支持`,
    body: `${contact}，您好：\n\n感谢您联系 HOMY。\n\nHOMY 是印尼海绵工厂，可为沙发、床垫、包装和工业用途提供海绵产品支持，包括产品推荐、样品安排、报价和长期稳定供货。\n\n为了给您准备合适方案，请提供所需海绵类型、密度、尺寸、数量和使用场景。我们的销售团队会尽快跟进产品建议和报价。\n\nHOMY 销售团队`
  };
}
