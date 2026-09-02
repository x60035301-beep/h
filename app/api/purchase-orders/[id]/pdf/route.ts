import { NextResponse } from "next/server";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { parsePurchaseOrderNotes } from "@/lib/purchase-order-meta";
import { getPurchaseOrderUnitPrice } from "@/lib/purchase-order-pricing";
import { getPurchaseOrderSupplier } from "@/lib/purchase-order-supplier";
import { parseQuotationItemNotes } from "@/lib/quotation-item-meta";
import { calculateFoamLineAmount } from "@/lib/quotation-pricing";
import { formatDate } from "@/lib/utils";

type Context = { params: Promise<{ id: string }> };
type Order = {
  id: string;
  quotation_no: string;
  customer_id: string;
  currency: string;
  total_amount: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
};
type Item = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  notes: string | null;
};
type Customer = {
  company_name: string;
  contact_name: string | null;
  whatsapp: string | null;
};
type Settings = { company_name: string; metadata?: unknown };

const PDF_FONT = "NotoSansSC";
let cachedPdfFont: Buffer | null = null;

function getPdfFont() {
  cachedPdfFont ??= readFileSync(join(process.cwd(), "assets", "fonts", "NotoSansCJKsc-Regular.otf"));
  return cachedPdfFont;
}

export async function GET(_: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data: order, error } = await context.supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .like("quotation_no", "PO-%")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

    const [{ data: items, error: itemError }, { data: customer, error: customerError }, { data: settings }] = await Promise.all([
      context.supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      context.supabase.from("customers").select("company_name,contact_name,whatsapp").eq("id", order.customer_id).maybeSingle(),
      context.supabase.from("settings").select("company_name,metadata").is("deleted_at", null).limit(1).maybeSingle()
    ]);
    if (itemError) throw itemError;
    if (customerError) throw customerError;
    if (!customer) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    const buffer = await renderPurchaseOrder({
      order: order as Order,
      items: (items ?? []) as Item[],
      customer: customer as Customer,
      settings: (settings ?? { company_name: "HOMY Sponge Factory" }) as Settings
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${order.quotation_no}.pdf"`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function renderPurchaseOrder({ order, items, customer, settings }: { order: Order; items: Item[]; customer: Customer; settings: Settings }) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 36 });
    doc.registerFont(PDF_FONT, getPdfFont());
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const colors = { navy: "#073F67", blue: "#087EC4", light: "#EAF3FB", gray: "#EEF0F4", border: "#B8C3CE", text: "#111827" };
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;
    const meta = parsePurchaseOrderNotes(order.notes);
    const currency = order.currency.toUpperCase();
    const supplier = getPurchaseOrderSupplier(settings.metadata);
    const pricedItems = items.map((item) => {
      const itemMeta = parseQuotationItemNotes(item.notes);
      const unitPrice = getPurchaseOrderUnitPrice(itemMeta.density, item.unit_price);
      const amount = calculateFoamLineAmount({ unitPrice, size: itemMeta.size, quantity: item.quantity })?.amount ?? item.amount;
      return { ...item, unit_price: unitPrice, amount };
    });
    const totalAmount = pricedItems.reduce((sum, item) => sum + Number(item.amount ?? 0), 0) || order.total_amount;

    drawHeader(doc, left, right, settings.company_name, colors);
    drawInfoBox(doc, left, 112, (width - 18) / 2, "供应商 / Pemasok", [
      supplier.name,
      supplier.location
    ], colors);
    drawInfoBox(doc, left + (width - 18) / 2 + 18, 112, (width - 18) / 2, "采购信息 / Informasi Pembelian", [
      `采购单号 / Nomor PO: ${order.quotation_no}`,
      `日期 / Tanggal: ${formatDate(order.created_at, "yyyy-MM-dd")}`,
      `交货日期 / Tanggal Pengiriman: ${order.valid_until ?? "-"}`,
      `币种 / Mata Uang: ${currency}`
    ], colors);

    let y = drawItemsTable(doc, 208, left, width, order, pricedItems, currency, colors);
    y = ensureSpace(doc, y + 12, 140, colors);
    drawFooter(doc, y, left, right, totalAmount, meta.note, meta.paymentTerms, currency, colors);
    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument, left: number, right: number, companyName: string, colors: Colors) {
  doc.rect(left, 34, 72, 52).fill(colors.navy);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(17).text("HOMY", left, 48, { width: 72, align: "center" });
  doc.font("Helvetica").fontSize(6).text("SPONGE FACTORY", left, 68, { width: 72, align: "center" });
  doc.fillColor(colors.text).font(PDF_FONT).fontSize(22).text(companyName || "HOMY Sponge Factory", left + 100, 48, {
    width: right - left - 200,
    align: "center"
  });
  doc.moveTo(left, 98).lineTo(left + 245, 98).strokeColor(colors.navy).lineWidth(1).stroke();
  doc.moveTo(right - 245, 98).lineTo(right, 98).stroke();
  doc.fillColor(colors.text).font(PDF_FONT).fontSize(18).text("采购单 / PESANAN PEMBELIAN", left, 90, { width: right - left, align: "center" });
}

function drawInfoBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number, title: string, rows: string[], colors: Colors) {
  doc.rect(x, y, width, 22).fill(colors.light);
  doc.fillColor(colors.text).font(PDF_FONT).fontSize(9).text(title, x + 8, y + 7, { width: width - 16 });
  rows.forEach((row, index) => {
    const rowY = y + 22 + index * 17;
    doc.rect(x, rowY, width, 17).fill(index === 0 ? colors.gray : "#FFFFFF");
    doc.fillColor(colors.text).font(PDF_FONT).fontSize(8).text(shorten(row, 90), x + 8, rowY + 5, {
      width: width - 16,
      lineBreak: false
    });
  });
  doc.rect(x, y, width, 90).strokeColor(colors.border).lineWidth(0.5).stroke();
}

function drawItemsTable(doc: PDFKit.PDFDocument, startY: number, left: number, width: number, order: Order, items: Item[], currency: string, colors: Colors) {
  const columns = [
    { title: "货号\nKode Barang", width: 80, align: "left" as const },
    { title: "品名\nNama Barang", width: 90, align: "left" as const },
    { title: "密度\nDensitas", width: 45, align: "center" as const },
    { title: "尺寸 / 规格\nUkuran / Spesifikasi", width: 90, align: "left" as const },
    { title: "数量\nJumlah", width: 40, align: "right" as const },
    { title: "总体积\nVolume (m3)", width: 60, align: "right" as const },
    { title: `单价 / Harga per m3\n(${currency})`, width: 85, align: "right" as const },
    { title: "单片价\nHarga per pcs", width: 75, align: "right" as const },
    { title: `金额 / Total\n(${currency})`, width: 85, align: "right" as const },
    { title: "备注\nKeterangan", width: width - 650, align: "left" as const }
  ];
  let y = startY;

  const drawHeading = () => {
    doc.rect(left, y, width, 24).fill(colors.navy);
    doc.fillColor("#FFFFFF").font(PDF_FONT).fontSize(10).text("采购明细 / DETAIL PESANAN", left, y + 7, { width, align: "center" });
    y += 24;
    let x = left;
    doc.rect(left, y, width, 34).fill(colors.blue);
    columns.forEach((column) => {
      doc.fillColor("#FFFFFF").font(PDF_FONT).fontSize(6.5).text(column.title, x + 4, y + 5, {
        width: column.width - 8,
        align: "center",
        height: 26
      });
      x += column.width;
    });
    y += 34;
  };

  drawHeading();
  const rows = items.length ? items : ([null] as Array<Item | null>);
  rows.forEach((item, index) => {
    if (y + 26 > doc.page.height - 150) {
      doc.addPage();
      y = 42;
      drawHeading();
    }
    const row = item ? makeRow(order, item, index, currency) : ["-", "-", "-", "-", "-", "-", "0", "0", "0", "-"];
    doc.rect(left, y, width, 26).fill(index % 2 ? colors.light : "#FFFFFF").strokeColor(colors.border).lineWidth(0.3).stroke();
    let x = left;
    columns.forEach((column, columnIndex) => {
      doc.save().rect(x, y, column.width, 26).clip();
      doc.fillColor(colors.text).font(PDF_FONT).fontSize(7).text(shorten(row[columnIndex], column.width > 100 ? 30 : column.width >= 90 ? 22 : 15), x + 4, y + 9, {
        width: column.width - 8,
        align: column.align,
        lineBreak: false
      });
      doc.restore();
      doc.moveTo(x, y).lineTo(x, y + 26).strokeColor(colors.border).lineWidth(0.25).stroke();
      x += column.width;
    });
    y += 26;
  });
  return y;
}

function makeRow(order: Order, item: Item, index: number, currency: string) {
  const meta = parseQuotationItemNotes(item.notes);
  const calculation = calculateFoamLineAmount({ unitPrice: item.unit_price, size: meta.size, quantity: item.quantity });
  const piecePrice = calculation?.singlePiecePrice ?? (item.quantity > 0 ? item.amount / item.quantity : 0);
  return [
    `PO-${order.quotation_no.split("-").at(-1)}-${String(index + 1).padStart(2, "0")}`,
    item.product_name,
    meta.density ?? "-",
    [meta.size, meta.specification].filter(Boolean).join(" / ") || "-",
    formatNumber(item.quantity, 2),
    calculation ? formatNumber(calculation.totalVolume, 4) : "-",
    formatMoney(item.unit_price, currency),
    formatMoney(piecePrice, currency),
    formatMoney(item.amount, currency),
    meta.note ?? "-"
  ];
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  y: number,
  left: number,
  right: number,
  totalAmount: number,
  note: string | null,
  paymentTerms: string | null,
  currency: string,
  colors: Colors
) {
  const totalsX = right - 230;
  doc.fillColor(colors.text).font(PDF_FONT).fontSize(9).text("备注 / Catatan", left, y);
  doc.font(PDF_FONT).fontSize(8).text(note || "-", left, y + 17, { width: totalsX - left - 20, height: 30 });
  doc.font(PDF_FONT).fontSize(9).text("付款方式 / Cara Pembayaran", left, y + 52);
  doc.font(PDF_FONT).fontSize(8).text(paymentTerms || "-", left, y + 69, { width: totalsX - left - 20, height: 30 });

  const totals = [["小计 / Sub Total", totalAmount], ["折扣 / Diskon", 0], ["税额 / PPN (0%)", 0], ["其他费用 / Biaya Lain-lain", 0], ["合计 / Total", totalAmount]] as const;
  totals.forEach(([label, value], index) => {
    const rowY = y + index * 18;
    const total = index === totals.length - 1;
    doc.rect(totalsX, rowY, 115, 18).fill(total ? colors.navy : colors.gray);
    doc.rect(totalsX + 115, rowY, 115, 18).fill(total ? colors.navy : colors.gray);
    doc.fillColor(total ? "#FFFFFF" : colors.text).font(PDF_FONT).fontSize(8);
    doc.text(label, totalsX + 6, rowY + 5, { width: 103 });
    doc.text(formatMoney(value, currency), totalsX + 121, rowY + 5, { width: 103, align: "right" });
  });

  const signatureY = y + 100;
  const signatureWidth = (right - left) / 3;
  ["采购部 / Bagian Pembelian", "审核 / Diperiksa Oleh", "批准 / Disetujui Oleh"].forEach((label, index) => {
    const x = left + signatureWidth * index;
    doc.font(PDF_FONT).fontSize(8).fillColor(colors.text).text(label, x, signatureY, { width: signatureWidth, align: "center", lineBreak: false });
    doc.moveTo(x + 42, signatureY + 30).lineTo(x + signatureWidth - 42, signatureY + 30).strokeColor(colors.border).stroke();
    doc.text("日期 / Tanggal:", x + 42, signatureY + 35, { width: signatureWidth - 84, lineBreak: false });
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, height: number, colors: Colors) {
  if (y + height <= doc.page.height - doc.page.margins.bottom) return y;
  doc.addPage();
  doc.moveTo(doc.page.margins.left, 30).lineTo(doc.page.width - doc.page.margins.right, 30).strokeColor(colors.navy).stroke();
  return doc.page.margins.top;
}

function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(Number(value ?? 0));
}

function formatMoney(value: number, currency: string) {
  return formatNumber(Number(value ?? 0), currency === "IDR" ? 0 : 2);
}

function shorten(value: string, length: number) {
  return value.length <= length ? value : `${value.slice(0, Math.max(0, length - 1))}.`;
}

type Colors = { navy: string; blue: string; light: string; gray: string; border: string; text: string };
