import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import { getApiContext, handleApiError, isApiError, type ApiContext } from "@/lib/api";
import { parseQuotationItemNotes } from "@/lib/quotation-item-meta";
import { formatDate } from "@/lib/utils";

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
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  notes: string | null;
};

type PdfProduct = {
  id: string;
  name: string;
  specification: string | null;
  density: string | null;
  size: string | null;
};

type PdfPrintableItem = PdfQuotationItem & {
  density: string | null;
  specification: string | null;
  size: string | null;
  display_note: string | null;
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
        context.supabase
          .from("quotation_items")
          .select("*")
          .eq("quotation_id", quotation.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true }),
        context.supabase.from("customers").select("*").eq("id", quotation.customer_id).is("deleted_at", null).maybeSingle(),
        context.supabase.from("settings").select("*").is("deleted_at", null).limit(1).maybeSingle()
      ]);
    if (itemError) throw itemError;
    if (customerError) throw customerError;
    if (settingsError) throw settingsError;
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const printableItems = await getPrintableItems(context.supabase, (items ?? []) as PdfQuotationItem[]);

    const buffer = await renderQuotationPdf({
      quotation: quotation as PdfQuotation,
      items: printableItems,
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

async function getPrintableItems(supabase: ApiContext["supabase"], items: PdfQuotationItem[]) {
  const productIds = Array.from(new Set(items.map((item) => item.product_id).filter(Boolean))) as string[];
  if (productIds.length === 0) {
    return items.map((item) => ({
      ...item,
      ...metaToPrintableFields(item.notes),
      notes: item.notes
    }));
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,specification,density,size")
    .in("id", productIds)
    .is("deleted_at", null);
  if (error) throw error;

  const typedProducts = (products ?? []) as PdfProduct[];
  const productMap = new Map(typedProducts.map((product) => [product.id, product]));
  return items.map((item) => {
    const product = item.product_id ? productMap.get(item.product_id) : null;
    const meta = parseQuotationItemNotes(item.notes);

    return {
      ...item,
      density: meta.density ?? product?.density ?? null,
      specification: meta.specification ?? product?.specification ?? meta.note ?? null,
      size: meta.size ?? product?.size ?? null,
      display_note: meta.note
    };
  });
}

function metaToPrintableFields(notes: string | null): Pick<PdfPrintableItem, "density" | "specification" | "size" | "display_note"> {
  const meta = parseQuotationItemNotes(notes);

  return {
    density: meta.density,
    specification: meta.specification ?? meta.note,
    size: meta.size,
    display_note: meta.note
  };
}

function renderQuotationPdf({
  quotation,
  items,
  customer,
  settings
}: {
  quotation: PdfQuotation;
  items: PdfPrintableItem[];
  customer: PdfCustomer;
  settings: PdfSettings;
}) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const palette = {
      navy: "#073F67",
      blue: "#087EC4",
      lightBlue: "#EAF3FB",
      softGray: "#EEF0F4",
      border: "#C7D0D9",
      text: "#111827",
      muted: "#667085"
    };
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const tableWidth = right - left;
    const subtotal = items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0) || quotation.total_amount;
    const currency = quotation.currency.toUpperCase();

    drawHeader(doc, { left, right, palette, settings });

    let y = 112;
    y = drawInfoSection(doc, {
      y,
      left,
      width: tableWidth,
      palette,
      quotation,
      customer
    });

    y += 14;
    y = drawDensityTable(doc, {
      y,
      left,
      width: tableWidth,
      palette,
      items,
      currency
    });

    y += 12;
    y = drawSpecificationTable(doc, {
      y,
      left,
      width: tableWidth,
      palette,
      quotation,
      items,
      currency
    });

    y += 10;
    y = drawSummaryAndNotes(doc, {
      y,
      left,
      right,
      palette,
      quotation,
      subtotal,
      currency
    });

    drawSignature(doc, {
      y: ensureSpace(doc, y + 8, 74, palette),
      left,
      right,
      palette
    });

    doc.end();
  });
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  {
    left,
    right,
    palette,
    settings
  }: {
    left: number;
    right: number;
    palette: PdfPalette;
    settings: PdfSettings;
  }
) {
  doc.rect(left, 34, 68, 52).fill(palette.navy);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(15).text("HOMY", left, 49, { width: 68, align: "center" });
  doc.font("Helvetica").fontSize(6.5).text("SPONGE FACTORY", left, 66, { width: 68, align: "center" });

  doc
    .fillColor(palette.text)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(settings.company_name || "HOMY SPONGE FACTORY", left + 88, 34, { width: right - left - 176, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(palette.text)
    .text(settings.address ?? "Surabaya Industrial Area, East Java, Indonesia", left + 88, 58, {
      width: right - left - 176,
      align: "center"
    })
    .text([settings.phone, settings.email].filter(Boolean).join("  |  "), left + 88, 75, {
      width: right - left - 176,
      align: "center"
    });

  doc.moveTo(left, 96).lineTo(left + 180, 96).strokeColor(palette.text).lineWidth(0.8).stroke();
  doc.moveTo(right - 180, 96).lineTo(right, 96).stroke();
  doc.fillColor(palette.text).font("Helvetica-Bold").fontSize(15).text("PENAWARAN HARGA BUSA", left, 89, {
    width: right - left,
    align: "center"
  });
}

function drawInfoSection(
  doc: PDFKit.PDFDocument,
  {
    y,
    left,
    width,
    palette,
    quotation,
    customer
  }: {
    y: number;
    left: number;
    width: number;
    palette: PdfPalette;
    quotation: PdfQuotation;
    customer: PdfCustomer;
  }
) {
  const gap = 18;
  const boxWidth = (width - gap) / 2;
  drawInfoBox(doc, left, y, boxWidth, "Kepada", [
    customer.company_name,
    `Contact: ${customer.contact_name ?? "-"}`,
    `Country: ${customer.country ?? "-"}`
  ], palette);
  drawInfoBox(doc, left + boxWidth + gap, y, boxWidth, "Dokumen Penawaran", [
    `Nomor: ${quotation.quotation_no}`,
    `Tanggal: ${formatDate(quotation.created_at, "yyyy-MM-dd")}`,
    `Berlaku Sampai: ${quotation.valid_until ?? "-"}`
  ], palette);
  return y + 82;
}

function drawInfoBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number, title: string, rows: string[], palette: PdfPalette) {
  const headerHeight = 22;
  const rowHeight = 18;
  doc.rect(x, y, width, headerHeight).fill(palette.lightBlue);
  doc.fillColor(palette.text).font("Helvetica-Bold").fontSize(9).text(title, x + 8, y + 7, { width: width - 16 });
  rows.forEach((row, index) => {
    const rowY = y + headerHeight + index * rowHeight;
    doc.rect(x, rowY, width, rowHeight).fill(index === 0 ? palette.softGray : "#FFFFFF");
    doc.fillColor(palette.text).font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(index === 0 ? 9 : 8);
    doc.text(truncate(row, 74), x + 8, rowY + 5, { width: width - 16, lineBreak: false });
  });
  doc.rect(x, y, width, headerHeight + rows.length * rowHeight).strokeColor(palette.border).lineWidth(0.5).stroke();
}

function drawDensityTable(
  doc: PDFKit.PDFDocument,
  {
    y,
    left,
    width,
    palette,
    items,
    currency
  }: {
    y: number;
    left: number;
    width: number;
    palette: PdfPalette;
    items: PdfPrintableItem[];
    currency: string;
  }
) {
  return drawTable(
    doc,
    y,
    "HARGA BERDASARKAN DENSITY",
    [
      { header: "NO", width: 38, align: "center", value: (_item, index) => String(index + 1) },
      { header: "KETERANGAN", width: 236, value: (item) => formatDensityLabel(item.density, item.product_name) },
      { header: "SATUAN / KUBIK", width: 118, align: "center", value: (item) => formatQuantity(item.quantity) },
      { header: `HARGA / KUBIK (${currency})`, width: width - 38 - 236 - 118, align: "right", value: (item) => formatMoneyValue(item.unit_price, currency) }
    ],
    items,
    { left, width, palette }
  );
}

function drawSpecificationTable(
  doc: PDFKit.PDFDocument,
  {
    y,
    left,
    width,
    palette,
    quotation,
    items,
    currency
  }: {
    y: number;
    left: number;
    width: number;
    palette: PdfPalette;
    quotation: PdfQuotation;
    items: PdfPrintableItem[];
    currency: string;
  }
) {
  return drawTable(
    doc,
    y,
    "SPESIFIKASI PENAWARAN",
    [
      { header: "Kode Barang", width: 70, value: (item, index) => makeItemCode(quotation, item, index) },
      { header: "Nama Barang", width: 116, value: (item) => item.product_name },
      { header: "Density", width: 55, align: "center", value: (item) => formatDensityValue(item.density) },
      { header: "Ukuran / Spec", width: 94, value: (item) => buildSpecificationText(item) },
      { header: "Qty.", width: 44, align: "right", value: (item) => formatQuantity(item.quantity) },
      { header: `@Harga (${currency})`, width: 64, align: "right", value: (item) => formatMoneyValue(item.unit_price, currency) },
      { header: `Total (${currency})`, width: 68, align: "right", value: (item) => formatMoneyValue(item.amount, currency) },
      { header: "Ket", width: width - 70 - 116 - 55 - 94 - 44 - 64 - 68, value: (item) => buildNoteText(item) }
    ],
    items,
    { left, width, palette, fontSize: 7.5, rowHeight: 26 }
  );
}

function drawTable<T>(
  doc: PDFKit.PDFDocument,
  y: number,
  title: string,
  columns: PdfTableColumn<T>[],
  rows: T[],
  {
    left,
    width,
    palette,
    fontSize = 8,
    rowHeight = 24
  }: {
    left: number;
    width: number;
    palette: PdfPalette;
    fontSize?: number;
    rowHeight?: number;
  }
) {
  y = ensureSpace(doc, y, 60 + Math.min(rows.length, 5) * rowHeight, palette);

  const drawTableHeader = () => {
    doc.rect(left, y, width, 24).fill(palette.navy);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10).text(title, left, y + 7, { width, align: "center" });
    y += 24;

    let x = left;
    doc.rect(left, y, width, 23).fill(palette.blue);
    columns.forEach((column) => {
      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(fontSize)
        .text(column.header, x + 5, y + 7, {
          width: column.width - 10,
          align: column.align ?? "left",
          lineBreak: false
        });
      x += column.width;
    });
    y += 23;
  };

  drawTableHeader();

  const tableRows = rows.length > 0 ? rows : ([null] as T[]);
  tableRows.forEach((row, rowIndex) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      drawTableHeader();
    }

    const fill = rowIndex % 2 === 1 ? palette.lightBlue : "#FFFFFF";
    doc.rect(left, y, width, rowHeight).fill(fill).strokeColor(palette.border).lineWidth(0.3).stroke();

    let x = left;
    columns.forEach((column) => {
      const value = row === null ? "-" : column.value(row, rowIndex);
      doc
        .fillColor(palette.text)
        .font("Helvetica")
        .fontSize(fontSize)
        .text(truncate(value, column.width > 100 ? 34 : 18), x + 5, y + 8, {
          width: column.width - 10,
          align: column.align ?? "left",
          lineBreak: false
        });
      doc.moveTo(x, y).lineTo(x, y + rowHeight).strokeColor(palette.border).lineWidth(0.25).stroke();
      x += column.width;
    });
    doc.moveTo(left + width, y).lineTo(left + width, y + rowHeight).strokeColor(palette.border).lineWidth(0.25).stroke();
    y += rowHeight;
  });

  return y;
}

function drawSummaryAndNotes(
  doc: PDFKit.PDFDocument,
  {
    y,
    left,
    right,
    palette,
    quotation,
    subtotal,
    currency
  }: {
    y: number;
    left: number;
    right: number;
    palette: PdfPalette;
    quotation: PdfQuotation;
    subtotal: number;
    currency: string;
  }
) {
  y = ensureSpace(doc, y, 112, palette);
  const noteWidth = 260;
  doc.fillColor(palette.text).font("Helvetica-Bold").fontSize(9).text("Keterangan", left, y);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(palette.text)
    .text(quotation.notes || "Harga berlaku sesuai masa berlaku penawaran. Pengiriman dan pembayaran mengikuti kesepakatan kedua pihak.", left, y + 18, {
      width: noteWidth,
      height: 54
    });
  doc.moveTo(left, y + 76).lineTo(left + noteWidth, y + 76).dash(1, { space: 2 }).strokeColor(palette.text).stroke().undash();

  const totalsX = right - 188;
  const labelWidth = 96;
  const valueWidth = 92;
  const rows = [
    ["Sub Total", subtotal],
    ["Diskon", 0],
    ["PPN (0%)", 0],
    ["Biaya Lain-lain", 0],
    ["Total", quotation.total_amount]
  ];

  rows.forEach(([label, value], index) => {
    const rowY = y + index * 18;
    const isTotal = index === rows.length - 1;
    doc.rect(totalsX, rowY, labelWidth, 18).fill(isTotal ? palette.navy : palette.softGray);
    doc.rect(totalsX + labelWidth, rowY, valueWidth, 18).fill(isTotal ? palette.navy : palette.softGray);
    doc
      .fillColor(isTotal ? "#FFFFFF" : palette.text)
      .font(isTotal ? "Helvetica-Bold" : "Helvetica")
      .fontSize(8)
      .text(String(label), totalsX + 6, rowY + 5, { width: labelWidth - 12 });
    doc.text(formatMoneyValue(Number(value), currency), totalsX + labelWidth + 6, rowY + 5, {
      width: valueWidth - 12,
      align: "right"
    });
  });

  return y + 96;
}

function drawSignature(
  doc: PDFKit.PDFDocument,
  {
    y,
    left,
    right,
    palette
  }: {
    y: number;
    left: number;
    right: number;
    palette: PdfPalette;
  }
) {
  doc.fillColor(palette.text).font("Helvetica").fontSize(8).text("Bagian Penjualan", left + 8, y, { width: 160, align: "center" });
  doc.text("Disetujui Oleh,", right - 168, y, { width: 160, align: "center" });
  doc.moveTo(left + 24, y + 58).lineTo(left + 144, y + 58).strokeColor(palette.border).lineWidth(0.6).stroke();
  doc.moveTo(right - 144, y + 58).lineTo(right - 24, y + 58).stroke();
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, requiredHeight: number, palette: PdfPalette) {
  if (y + requiredHeight <= doc.page.height - doc.page.margins.bottom) return y;
  doc.addPage();
  drawPageAccent(doc, palette);
  return doc.page.margins.top;
}

function drawPageAccent(doc: PDFKit.PDFDocument, palette: PdfPalette) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc.moveTo(left, 30).lineTo(right, 30).strokeColor(palette.navy).lineWidth(1).stroke();
}

function formatDensityLabel(density: string | null, fallback: string) {
  const value = formatDensityValue(density);
  return value === "-" ? fallback : `${value}-DCT`;
}

function formatDensityValue(density: string | null) {
  if (!density) return "-";
  const trimmed = density.trim();
  const number = trimmed.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".");
  if (number) return number;
  return trimmed.toUpperCase().replace(/\s+/g, " ");
}

function buildSpecificationText(item: PdfPrintableItem) {
  const density = formatDensityValue(item.density);
  const size = item.size?.trim();
  const specification = item.specification?.trim();
  if (density !== "-" && size) return `D.${density} UK ${size.toUpperCase()}`;
  if (size && specification) return `${size} / ${specification}`;
  return size ?? specification ?? "-";
}

function buildNoteText(item: PdfPrintableItem) {
  if (item.display_note) return item.display_note;
  const quantity = Number(item.quantity ?? 0);
  return quantity > 0 ? `${formatQuantity(quantity)} kubik` : "-";
}

function makeItemCode(quotation: PdfQuotation, item: PdfPrintableItem, index: number) {
  const dateCode = formatDate(quotation.created_at, "yyyyMMdd");
  const productCode = item.product_id ? item.product_id.slice(0, 4).toUpperCase() : "FOAM";
  return `HOMY-${dateCode}-${productCode}-${String(index + 1).padStart(2, "0")}`;
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
  }).format(Number(value ?? 0));
}

function formatMoneyValue(value: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  const maximumFractionDigits = normalizedCurrency === "IDR" ? 0 : 2;

  try {
    return new Intl.NumberFormat(normalizedCurrency === "IDR" ? "id-ID" : "en-US", {
      maximumFractionDigits
    }).format(Number(value ?? 0));
  } catch {
    return Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits });
  }
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}.`;
}

type PdfPalette = {
  navy: string;
  blue: string;
  lightBlue: string;
  softGray: string;
  border: string;
  text: string;
  muted: string;
};

type PdfTableColumn<T> = {
  header: string;
  width: number;
  align?: "left" | "center" | "right";
  value: (row: T, index: number) => string;
};
