import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Factory, FileText, Inbox, Mail, MessageCircle, PackageOpen, Phone, Sparkles } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { AttachmentUpload } from "@/components/customers/attachment-upload";
import { CustomerForm } from "@/components/customers/customer-form";
import { FollowupForm } from "@/components/customers/followup-form";
import { FollowupTimeline } from "@/components/customers/followup-timeline";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  aiCrmCopy,
  customer360Profiles,
  inquiryRecords,
  orderRecords,
  productionOrders,
  text
} from "@/data/ai-crm";
import { getCustomerDetail } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";

const detailLabels = {
  zh: {
    website: "官网",
    address: "地址",
    product: "产品",
    budget: "预算",
    delivered: "已送达",
    preparing: "准备中",
    confirmSample: "确认手感和密度",
    sendTracking: "发送物流单号",
    noInquiries: "暂无询盘记录",
    noOrders: "暂无订单记录",
    noSamples: "暂无样品记录",
    noProduction: "暂无生产记录",
    noQuotations: "暂无报价记录",
    noAttachments: "暂无附件",
    noAiReport: "暂无 AI 分析报告"
  },
  en: {
    website: "Website",
    address: "Address",
    product: "Product",
    budget: "Budget",
    delivered: "Delivered",
    preparing: "Preparing",
    confirmSample: "Confirm feel and density",
    sendTracking: "Send tracking number",
    noInquiries: "No inquiry records",
    noOrders: "No order records",
    noSamples: "No sample records",
    noProduction: "No production records",
    noQuotations: "No quotation records",
    noAttachments: "No attachments",
    noAiReport: "No AI report"
  },
  id: {
    website: "Website",
    address: "Alamat",
    product: "Produk",
    budget: "Budget",
    delivered: "Terkirim",
    preparing: "Disiapkan",
    confirmSample: "Konfirmasi feel dan density",
    sendTracking: "Kirim nomor resi",
    noInquiries: "Belum ada inquiry",
    noOrders: "Belum ada order",
    noSamples: "Belum ada sampel",
    noProduction: "Belum ada produksi",
    noQuotations: "Belum ada quotation",
    noAttachments: "Belum ada lampiran",
    noAiReport: "Belum ada laporan AI"
  }
} as const;

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const copy = dictionary.customerDetail;
  const aiCopy = aiCrmCopy[locale];
  const c360 = aiCopy.customer360;
  const labels = detailLabels[locale];
  const profile = customer360Profiles.default;
  const { customer, contacts, followups, quotations, quotationItems, attachments } = await getCustomerDetail(id);

  return (
    <div className="page-shell">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/customers`}>
            <ArrowLeft />
            {copy.back}
          </Link>
        </Button>
      </div>

      <PageHeader
        title={customer.company_name}
        description={`${customer.country ?? "-"} · ${customer.industry ?? "-"} · ${copy.lastContact} ${formatDate(
          customer.last_contacted_at,
          "yyyy-MM-dd HH:mm",
          locale
        )}`}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{copy.edit}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{copy.editTitle}</DialogTitle>
                <DialogDescription>{copy.editDescription}</DialogDescription>
              </DialogHeader>
              <CustomerForm customer={customer} />
            </DialogContent>
          </Dialog>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label={copy.stage} value={dictionary.customerStages[customer.stage]} />
        <SummaryCard label={c360.ltv} value={profile.ltv} />
        <SummaryCard label={aiCopy.common.probability} value={`${profile.winProbability}%`} />
        <SummaryCard label={aiCopy.common.risk} value={`${profile.churnRisk}%`} />
      </section>

      <Tabs defaultValue="overview" className="min-w-0">
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{c360.overview}</TabsTrigger>
          <TabsTrigger value="contacts">{c360.contacts}</TabsTrigger>
          <TabsTrigger value="inquiry">{c360.inquiry}</TabsTrigger>
          <TabsTrigger value="quotations">{c360.quotations}</TabsTrigger>
          <TabsTrigger value="orders">{c360.orders}</TabsTrigger>
          <TabsTrigger value="samples">{c360.samples}</TabsTrigger>
          <TabsTrigger value="production">{c360.production}</TabsTrigger>
          <TabsTrigger value="finance">{c360.finance}</TabsTrigger>
          <TabsTrigger value="attachments">{c360.attachments}</TabsTrigger>
          <TabsTrigger value="timeline">{c360.timeline}</TabsTrigger>
          <TabsTrigger value="ai">{c360.aiAnalysis}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{copy.basicInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Info label={copy.grade} value={<Badge variant={customer.grade === "A" ? "success" : "secondary"}>{customer.grade}</Badge>} />
                <Info label={copy.companyType} value={customer.company_type ?? "-"} />
                <Info label={copy.source} value={customer.source ?? "-"} />
                <Info label="WhatsApp" value={customer.whatsapp ?? "-"} />
                <Info label="Email" value={customer.email ?? "-"} />
                <Info label={copy.notes} value={(customer as { notes?: string | null }).notes ?? "-"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{c360.businessInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Info label={c360.annualPurchase} value={profile.annualPurchase} />
                <Info label={c360.employees} value={profile.employees.toString()} />
                <Info label={c360.mainProducts} value={profile.mainProducts} />
                <Info label={c360.factoryArea} value={profile.factoryArea} />
                <Info label={c360.certifications} value={profile.certifications} />
                <Info label={c360.paymentMethod} value={profile.paymentMethod} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{c360.socialInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Info label={labels.website} value={profile.website} />
                <Info label="TikTok" value={profile.tiktok} />
                <Info label="Facebook" value={profile.facebook} />
                <Info label="LinkedIn" value={profile.linkedin} />
                <Info label="Instagram" value={profile.instagram} />
                <Info label={labels.address} value={`${profile.city}, ${profile.address}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>{copy.contacts}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{contact.name}</p>
                    {contact.is_primary ? <Badge variant="secondary">{copy.primary}</Badge> : null}
                  </div>
                  {contact.title ? <p className="mt-1 text-muted-foreground">{contact.title}</p> : null}
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    {contact.email ? <ContactLine icon={<Mail className="size-3" />} value={contact.email} /> : null}
                    {contact.whatsapp ? <ContactLine icon={<MessageCircle className="size-3" />} value={contact.whatsapp} /> : null}
                    {contact.phone ? <ContactLine icon={<Phone className="size-3" />} value={contact.phone} /> : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiry">
          {inquiryRecords.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {inquiryRecords.map((inquiry) => (
                <Link key={inquiry.id} href={`/${locale}/inquiries/${encodeURIComponent(inquiry.id)}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="h-full transition hover:border-primary/40 hover:shadow-soft">
                    <CardHeader>
                      <CardTitle>{inquiry.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <Info label={aiCopy.common.customer} value={inquiry.customer} />
                      <Info label={labels.product} value={inquiry.product} />
                      <Info label={labels.budget} value={inquiry.budget} />
                      <Info label="AI" value={`${text(inquiry.aiKind, locale)} - ${inquiry.aiSpec} - ${inquiry.aiQuote}`} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Inbox} title={labels.noInquiries} />
          )}
        </TabsContent>

        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <CardTitle>{copy.quotationRecords}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quotations.length ? (
                quotations.map((quotation) => (
                  <div key={quotation.id} className="rounded-md border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{quotation.quotation_no}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(quotation.created_at, "yyyy-MM-dd HH:mm", locale)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(quotation.total_amount, quotation.currency)}</p>
                        <Badge variant="secondary">{dictionary.quotationStatuses[quotation.status]}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      {quotationItems
                        .filter((item) => item.quotation_id === quotation.id)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2">
                            <span>{item.product_name}</span>
                            <span>{formatCurrency(item.amount, quotation.currency)}</span>
                          </div>
                        ))}
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <Link href={`/api/quotations/${quotation.id}/pdf`} target="_blank">
                        <FileText />
                        PDF
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <EmptyState icon={FileText} title={labels.noQuotations} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          {orderRecords.length ? (
            <div className="grid gap-4">
              {orderRecords.map((order) => (
                <Link key={order.id} href={`/${locale}/orders/${encodeURIComponent(order.id)}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="transition hover:border-primary/40 hover:shadow-soft">
                    <CardHeader>
                      <CardTitle>{order.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Info label={aiCopy.common.amount} value={formatCurrency(order.amount)} />
                      <Info label={aiCopy.common.status} value={text(order.status, locale)} />
                      <ProgressLine value={order.progress} label={aiCopy.common.progress} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={ClipboardList} title={labels.noOrders} />
          )}
        </TabsContent>

        <TabsContent value="samples">
          <EmptyState icon={PackageOpen} title={labels.noSamples} />
        </TabsContent>

        <TabsContent value="production">
          {productionOrders.length ? (
            <div className="grid gap-4">
              {productionOrders.map((order) => (
                <Link key={order.order} href={`/${locale}/production/${encodeURIComponent(order.order)}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="transition hover:border-primary/40 hover:shadow-soft">
                    <CardHeader>
                      <CardTitle>{order.order}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Info label={aiCopy.common.owner} value={order.owner} />
                      <ProgressLine value={order.progress} label={aiCopy.common.progress} />
                      <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
                        {order.stages.map((stage) => (
                          <div key={stage.name} className="rounded-md border p-2 text-xs">
                            <p className="font-medium">{stage.name}</p>
                            <ProgressLine value={stage.progress} className="mt-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Factory} title={labels.noProduction} />
          )}
        </TabsContent>

        <TabsContent value="finance">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label={c360.creditRating} value={profile.creditRating} />
            <SummaryCard label={c360.paymentMethod} value={profile.paymentMethod} />
            <SummaryCard label={c360.profitMargin} value={profile.profitMargin} />
            <SummaryCard label={c360.lastDeal} value={profile.lastDeal} />
          </div>
        </TabsContent>

        <TabsContent value="attachments">
          <div className="space-y-4">
            <AttachmentUpload customerId={customer.id} locale={locale} />
            <Card>
              <CardHeader>
                <CardTitle>{copy.customerAttachments}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attachments.length ? (
                  attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted"
                      href={attachment.file_url}
                      target="_blank"
                    >
                      <span>{attachment.file_name}</span>
                      <Badge variant="secondary">{attachment.file_type}</Badge>
                    </a>
                  ))
                ) : (
                  <EmptyState icon={FileText} title={labels.noAttachments} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <FollowupTimeline followups={followups} />
            <Card>
              <CardHeader>
                <CardTitle>{copy.addFollowup}</CardTitle>
              </CardHeader>
              <CardContent>
                <FollowupForm customerId={customer.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  <CardTitle>{c360.aiAnalysis}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressLine value={profile.aiScore} label={`${aiCopy.common.score} ${profile.aiScore}/100`} />
                <ProgressLine value={profile.winProbability} label={`${aiCopy.common.probability} ${profile.winProbability}%`} />
                <ProgressLine value={profile.churnRisk} label={`${aiCopy.common.risk} ${profile.churnRisk}%`} />
                <p className="rounded-md bg-muted p-3 text-sm">{text(profile.aiSummary, locale)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{c360.report}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.aiReport.length ? (
                  profile.aiReport.map((item) => (
                    <div key={item.en} className="rounded-md border p-3 text-sm">
                      {text(item, locale)}
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Sparkles} title={labels.noAiReport} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ContactLine({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      {value}
    </span>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[70%] text-right">{value}</span>
    </div>
  );
}
