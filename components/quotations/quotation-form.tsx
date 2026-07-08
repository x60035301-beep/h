"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { quotationStatuses } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import { currencies, getCurrencyName } from "@/lib/currencies";
import { getDictionary } from "@/lib/dictionaries";
import { parseQuotationItemNotes } from "@/lib/quotation-item-meta";
import { formatCurrency } from "@/lib/utils";
import { quotationSchema, type QuotationInput } from "@/lib/validations";
import type { CustomerSummary, Locale, Product, Quotation, QuotationItem } from "@/types/crm";

type QuotationAdvice = {
  materialCostRatio: number;
  laborCostRatio: number;
  packingCostRatio: number;
  freightCostRatio: number;
  suggestedMargin: number;
  minimumPriceNote: string;
  suggestedPriceNote: string;
  riskNotes: string[];
  customerMessage: string;
};

const aiCopy = {
  zh: { button: "AI 报价建议", loading: "AI 分析中", title: "AI 报价建议", failed: "AI 报价建议失败", cost: "成本结构", margin: "建议利润", risk: "风险提醒", message: "客户回复建议" },
  en: { button: "AI quote advice", loading: "Analyzing", title: "AI quote advice", failed: "AI quote advice failed", cost: "Cost structure", margin: "Suggested margin", risk: "Risks", message: "Customer reply" },
  id: { button: "Saran AI", loading: "Menganalisis", title: "Saran penawaran AI", failed: "Saran AI gagal", cost: "Struktur biaya", margin: "Margin disarankan", risk: "Risiko", message: "Balasan customer" }
} as const;

const formCopy = {
  zh: {
    customer: "客户",
    selectCustomer: "选择客户",
    currency: "币种",
    selectCurrency: "选择币种",
    itemDetails: "产品明细",
    addItem: "新增明细",
    product: "产品",
    productName: "产品名称",
    itemNumber: "明细",
    pricingBasis: "报价方式",
    densityPricing: "密度报价",
    specificationPricing: "规格报价",
    density: "密度",
    specification: "规格",
    size: "尺寸",
    quantity: "数量",
    unitPrice: "单价",
    lineAmount: "金额",
    validUntil: "有效期",
    notes: "备注",
    notesPlaceholder: "FOB、MOQ、交期...",
    autoAmount: "自动计算金额",
    create: "创建报价",
    createFailed: "报价创建失败",
    createSuccess: "报价单已创建",
    documentGenerated: "报价单 PDF 已自动生成",
    documentBlocked: "浏览器拦截了自动打开，请点击列表右侧下载按钮。",
    generatingDocument: "正在生成报价单...",
    tryAgain: "请稍后再试。",
    material: "材料",
    labor: "人工",
    packing: "包装",
    freight: "运费"
  },
  en: {
    customer: "Customer",
    selectCustomer: "Select customer",
    currency: "Currency",
    selectCurrency: "Select currency",
    itemDetails: "Line items",
    addItem: "Add item",
    product: "Product",
    productName: "Product name",
    itemNumber: "Item",
    pricingBasis: "Quote basis",
    densityPricing: "Density price",
    specificationPricing: "Specification price",
    density: "Density",
    specification: "Specification",
    size: "Size",
    quantity: "Qty",
    unitPrice: "Unit price",
    lineAmount: "Amount",
    validUntil: "Valid until",
    notes: "Notes",
    notesPlaceholder: "FOB, MOQ, lead time...",
    autoAmount: "Auto calculated amount",
    create: "Create quotation",
    createFailed: "Quotation create failed",
    createSuccess: "Quotation created",
    documentGenerated: "Quotation PDF generated automatically",
    documentBlocked: "The browser blocked auto-open. Use the download button in the list.",
    generatingDocument: "Generating quotation...",
    tryAgain: "Please try again.",
    material: "Material",
    labor: "Labor",
    packing: "Packing",
    freight: "Freight"
  },
  id: {
    customer: "Pelanggan",
    selectCustomer: "Pilih pelanggan",
    currency: "Mata uang",
    selectCurrency: "Pilih mata uang",
    itemDetails: "Detail produk",
    addItem: "Tambah item",
    product: "Produk",
    productName: "Nama produk",
    itemNumber: "Item",
    pricingBasis: "Dasar harga",
    densityPricing: "Harga density",
    specificationPricing: "Harga spesifikasi",
    density: "Density",
    specification: "Spesifikasi",
    size: "Ukuran",
    quantity: "Qty",
    unitPrice: "Harga satuan",
    lineAmount: "Jumlah",
    validUntil: "Berlaku sampai",
    notes: "Catatan",
    notesPlaceholder: "FOB, MOQ, lead time...",
    autoAmount: "Jumlah otomatis",
    create: "Buat quotation",
    createFailed: "Gagal membuat quotation",
    createSuccess: "Quotation dibuat",
    documentGenerated: "PDF quotation dibuat otomatis",
    documentBlocked: "Browser memblokir buka otomatis. Gunakan tombol download di daftar.",
    generatingDocument: "Membuat quotation...",
    tryAgain: "Silakan coba lagi.",
    material: "Material",
    labor: "Tenaga kerja",
    packing: "Packing",
    freight: "Ongkir"
  }
} as const;

const modeCopy = {
  zh: {
    status: "状态",
    selectStatus: "选择状态",
    save: "保存报价",
    updateFailed: "报价更新失败",
    updateSuccess: "报价单已更新"
  },
  en: {
    status: "Status",
    selectStatus: "Select status",
    save: "Save quotation",
    updateFailed: "Quotation update failed",
    updateSuccess: "Quotation updated"
  },
  id: {
    status: "Status",
    selectStatus: "Pilih status",
    save: "Simpan quotation",
    updateFailed: "Gagal update quotation",
    updateSuccess: "Quotation diupdate"
  }
} as const;

const emptyQuotationItems: QuotationItem[] = [];

export function QuotationForm({
  locale,
  customers,
  products,
  mode = "create",
  quotation,
  items: initialItems = emptyQuotationItems,
  onSaved
}: {
  locale: Locale;
  customers: CustomerSummary[];
  products: Product[];
  mode?: "create" | "edit";
  quotation?: Quotation;
  items?: QuotationItem[];
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [advice, setAdvice] = useState<QuotationAdvice | null>(null);
  const aiText = aiCopy[locale];
  const copy = formCopy[locale];
  const modeText = modeCopy[locale];
  const dictionary = getDictionary(locale);
  const isEdit = mode === "edit" && Boolean(quotation);
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const densityOptions = useMemo(
    () =>
      uniqueOptions([
        ...products.map((product) => product.density),
        "10D",
        "12D",
        "14D",
        "16D",
        "18D",
        "19D",
        "20D",
        "22D",
        "23D",
        "24D",
        "26D",
        "30D",
        "32D",
        "45D"
      ]),
    [products]
  );
  const specificationOptions = useMemo(() => uniqueOptions(products.map((product) => product.specification)), [products]);
  const sizeOptions = useMemo(() => uniqueOptions(products.map((product) => product.size)), [products]);
  const defaultValues = useMemo<QuotationInput>(
    () => ({
      customer_id: quotation?.customer_id ?? customers[0]?.id ?? "",
      status: quotation?.status ?? "draft",
      currency: (quotation?.currency ?? "USD") as QuotationInput["currency"],
      notes: quotation?.notes ?? "",
      valid_until: quotation?.valid_until ?? "",
      items: initialItems.length
        ? initialItems.map((item) => {
            const meta = parseQuotationItemNotes(item.notes);
            const product = item.product_id ? productById.get(item.product_id) : null;

            return {
              product_id: item.product_id,
              product_name: item.product_name,
              density: meta.density ?? product?.density ?? item.density ?? "",
              specification: meta.specification ?? product?.specification ?? item.specification ?? "",
              size: meta.size ?? product?.size ?? item.size ?? "",
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: meta.note ?? ""
            };
          })
        : [
            {
              product_id: products[0]?.id ?? null,
              product_name: products[0]?.name ?? "",
              density: products[0]?.density ?? "",
              specification: products[0]?.specification ?? "",
              size: products[0]?.size ?? "",
              quantity: 1,
              unit_price: products[0]?.price ?? 0,
              notes: ""
            }
          ]
    }),
    [customers, initialItems, productById, products, quotation]
  );
  const form = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const currency = form.watch("currency");
  const total = useMemo(() => watchedItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0), [watchedItems]);

  useEffect(() => {
    form.reset(defaultValues);
    setAdvice(null);
  }, [defaultValues, form]);

  async function onSubmit(values: QuotationInput) {
    let documentWindow: Window | null = null;
    if (!isEdit && typeof window !== "undefined") {
      documentWindow = window.open("about:blank", "_blank");
      if (documentWindow) {
        documentWindow.document.title = copy.generatingDocument;
        documentWindow.document.body.innerHTML = `<p style="font-family: system-ui, sans-serif; padding: 24px;">${copy.generatingDocument}</p>`;
      }
    }

    setLoading(true);
    const response = await fetch(isEdit ? `/api/quotations/${quotation?.id}` : "/api/quotations", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      documentWindow?.close();
      toast({ title: isEdit ? modeText.updateFailed : copy.createFailed, description: payload?.error ?? copy.tryAgain, variant: "destructive" });
      return;
    }

    if (!isEdit) {
      const documentUrl = payload?.data?.document_url ?? (payload?.data?.id ? `/api/quotations/${payload.data.id}/pdf` : null);
      let blocked = false;

      if (documentUrl && typeof window !== "undefined") {
        const absoluteDocumentUrl = new URL(documentUrl, window.location.origin).toString();
        if (documentWindow) {
          documentWindow.location.href = absoluteDocumentUrl;
        } else {
          blocked = !window.open(absoluteDocumentUrl, "_blank");
        }
      } else {
        documentWindow?.close();
      }

      toast({ title: copy.createSuccess, description: blocked ? copy.documentBlocked : copy.documentGenerated });
    } else {
      toast({ title: modeText.updateSuccess });
    }

    onSaved?.();
    router.refresh();
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    form.setValue(`items.${index}.product_id`, productId);
    if (product) {
      form.setValue(`items.${index}.product_name`, product.name);
      form.setValue(`items.${index}.density`, product.density ?? "");
      form.setValue(`items.${index}.specification`, product.specification ?? "");
      form.setValue(`items.${index}.size`, product.size ?? "");
      form.setValue(`items.${index}.unit_price`, product.price);
    }
  }

  async function requestAiAdvice() {
    const values = form.getValues();
    const customer = customers.find((item) => item.id === values.customer_id);
    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/quotation-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          quotation: {
            customer,
            currency: values.currency,
            total,
            items: values.items
          }
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? aiText.failed);
      setAdvice(payload.data.advice);
    } catch (error) {
      toast({ title: aiText.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="grid gap-2 sm:col-span-2">
          <Label>{copy.customer}</Label>
          <Select value={form.watch("customer_id")} onValueChange={(value) => form.setValue("customer_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder={copy.selectCustomer} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{modeText.status}</Label>
          <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as QuotationInput["status"])}>
            <SelectTrigger>
              <SelectValue placeholder={modeText.selectStatus} />
            </SelectTrigger>
            <SelectContent>
              {quotationStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {dictionary.quotationStatuses[status.value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{copy.currency}</Label>
          <Select value={currency} onValueChange={(value) => form.setValue("currency", value as QuotationInput["currency"])}>
            <SelectTrigger>
              <SelectValue placeholder={copy.selectCurrency} />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  <span className="flex items-center gap-2">
                    <span className="w-10 font-medium">{item.code}</span>
                    <span className="text-muted-foreground">{item.symbol}</span>
                    <span>{getCurrencyName(item.code, locale)}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{copy.itemDetails}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ product_id: null, product_name: "", density: "", specification: "", size: "", quantity: 1, unit_price: 0, notes: "" })}
          >
            <Plus />
            {copy.addItem}
          </Button>
        </div>
        <datalist id="quotation-density-options">
          {densityOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="quotation-specification-options">
          {specificationOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="quotation-size-options">
          {sizeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        {fields.map((field, index) => {
          const amount = Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.unit_price || 0);
          return (
            <div key={field.id} className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm lg:grid-cols-12">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3 lg:col-span-12">
                <div>
                  <p className="font-medium">
                    {copy.itemNumber} #{index + 1}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {copy.pricingBasis}: {copy.densityPricing} / {copy.specificationPricing}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 />
                </Button>
              </div>

              <div className="grid gap-1 lg:col-span-6">
                <Label className="text-xs text-muted-foreground">{copy.product}</Label>
                <Select value={watchedItems[index]?.product_id ?? ""} onValueChange={(value) => selectProduct(index, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={copy.product} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1 lg:col-span-6">
                <Label className="text-xs text-muted-foreground">{copy.productName}</Label>
                <Input {...form.register(`items.${index}.product_name`)} placeholder={copy.productName} />
              </div>

              <div className="grid gap-3 rounded-md border border-primary/20 bg-primary/5 p-3 md:grid-cols-3 lg:col-span-12">
                <div className="grid gap-1">
                  <Label className="text-xs font-medium text-primary">{copy.densityPricing}</Label>
                  <Input list="quotation-density-options" {...form.register(`items.${index}.density`)} placeholder="18D / 20D / 22D" />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs font-medium text-primary">{copy.specificationPricing}</Label>
                  <Input list="quotation-specification-options" {...form.register(`items.${index}.specification`)} placeholder={copy.specification} />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs font-medium text-primary">{copy.size}</Label>
                  <Input list="quotation-size-options" {...form.register(`items.${index}.size`)} placeholder="120 x 180 x 1.5" />
                </div>
              </div>

              <div className="grid gap-1 lg:col-span-3">
                <Label className="text-xs text-muted-foreground">{copy.quantity}</Label>
                <Input type="number" step="0.01" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} placeholder={copy.quantity} />
              </div>
              <div className="grid gap-1 lg:col-span-3">
                <Label className="text-xs text-muted-foreground">{copy.unitPrice}</Label>
                <Input type="number" step="0.01" {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })} placeholder={copy.unitPrice} />
              </div>
              <div className="grid gap-1 lg:col-span-6">
                <Label className="text-xs text-muted-foreground">{copy.lineAmount}</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">{formatCurrency(amount, currency)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{copy.validUntil}</Label>
          <Input type="date" {...form.register("valid_until")} />
        </div>
        <div className="grid gap-2">
          <Label>{copy.notes}</Label>
          <Textarea className="min-h-9" {...form.register("notes")} placeholder={copy.notesPlaceholder} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
        <span className="text-sm text-muted-foreground">{copy.autoAmount}</span>
        <span className="text-lg font-semibold">{formatCurrency(total, currency)}</span>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{aiText.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{aiText.cost} / {aiText.margin} / {aiText.risk}</p>
          </div>
          <Button type="button" variant="outline" onClick={requestAiAdvice} disabled={aiLoading || !watchedItems.length}>
            {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {aiLoading ? aiText.loading : aiText.button}
          </Button>
        </div>
        {advice ? (
          <div className="mt-4 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-5">
              <AdviceMetric label={copy.material} value={`${advice.materialCostRatio}%`} />
              <AdviceMetric label={copy.labor} value={`${advice.laborCostRatio}%`} />
              <AdviceMetric label={copy.packing} value={`${advice.packingCostRatio}%`} />
              <AdviceMetric label={copy.freight} value={`${advice.freightCostRatio}%`} />
              <AdviceMetric label={aiText.margin} value={`${advice.suggestedMargin}%`} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <p className="rounded-md bg-muted p-3 text-sm">{advice.suggestedPriceNote}</p>
              <p className="rounded-md bg-muted p-3 text-sm">{advice.minimumPriceNote}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="mb-2 font-medium">{aiText.risk}</p>
              <ul className="list-disc space-y-1 pl-5">
                {advice.riskNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="mb-2 font-medium">{aiText.message}</p>
              <p className="leading-6">{advice.customerMessage}</p>
            </div>
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={loading || !customers.length}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {isEdit ? modeText.save : copy.create}
      </Button>
    </form>
  );
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
    )
  );
}

function AdviceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
