import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Context = { params: Promise<{ id: string }> };

type PdfQuotation = {
  id: string;
  quotation_no: string;
  currency: string;
  total_amount: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  customer_id: string;
};

type PdfQuotationItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

type PdfCustomer = {
  company_name: string;
  contact_name: string | null;
  country: string | null;
};

type PdfSettings = {
  company_name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
};

export async function GET(_: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data: quotation, error: quotationError } = await context.supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (quotationError) throw quotationError;
    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    const [{ data: items, error: itemError }, { data: customer, error: customerError }, { data: settings, error: settingsError }] =
      await Promise.all([
        context.supabase.from("quotation_items").select("*").eq("quotation_id", quotation.id).is("deleted_at", null),
        context.supabase.from("customers").select("*").eq("id", quotation.customer_id).is("deleted_at", null).maybeSingle(),
        context.supabase.from("settings").select("*").is("deleted_at", null).limit(1).maybeSingle()
      ]);
    if (itemError) throw itemError;
    if (customerError) throw customerError;
    if (settingsError) throw settingsError;
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const buffer = await renderQuotationPdf({
      quotation: quotation as PdfQuotation,
      items: (items ?? []) as PdfQuotationItem[],
      customer: customer as PdfCustomer,
      settings: (settings ?? {
        company_name: "HOMY Sponge Factory",
        address: null,
        email: null,
        phone: null
      }) as PdfSettings
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quotation.quotation_no}.pdf"`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function renderQuotationPdf({
  quotation,
  items,
  customer,
  settings
}: {
  quotation: PdfQuotation;
  items: PdfQuotationItem[];
  customer: PdfCustomer;
  settings: PdfSettings;
}) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text(settings.company_name, { align: "left" });
    doc.fontSize(10).fillColor("#555").text(settings.address ?? "").text(settings.email ?? "").text(settings.phone ?? "");
    doc.moveDown(2);
    doc.fillColor("#111").fontSize(16).text("Quotation");
    doc.fontSize(10).text(`Quotation No: ${quotation.quotation_no}`);
    doc.text(`Date: ${formatDate(quotation.created_at, "yyyy-MM-dd")}`);
    doc.text(`Valid Until: ${quotation.valid_until ?? "-"}`);
    doc.moveDown();
    doc.text(`Customer: ${customer.company_name}`);
    doc.text(`Contact: ${customer.contact_name ?? "-"}`);
    doc.text(`Country: ${customer.country ?? "-"}`);
    doc.moveDown();

    const startY = doc.y + 8;
    doc.fontSize(10).fillColor("#111");
    doc.text("Product", 48, startY);
    doc.text("Qty", 290, startY);
    doc.text("Unit Price", 350, startY);
    doc.text("Amount", 450, startY);
    doc.moveTo(48, startY + 16).lineTo(548, startY + 16).strokeColor("#ddd").stroke();
    let y = startY + 28;
    items.forEach((item) => {
      doc.text(item.product_name, 48, y, { width: 220 });
      doc.text(String(item.quantity), 290, y);
      doc.text(formatCurrency(item.unit_price, quotation.currency), 350, y);
      doc.text(formatCurrency(item.amount, quotation.currency), 450, y);
      y += 28;
    });
    doc.moveTo(48, y).lineTo(548, y).strokeColor("#ddd").stroke();
    doc.fontSize(12).text(`Total: ${formatCurrency(quotation.total_amount, quotation.currency)}`, 350, y + 16, { align: "right" });
    if (quotation.notes) {
      doc.moveDown(3);
      doc.fontSize(10).text(`Notes: ${quotation.notes}`);
    }
    doc.end();
  });
}
