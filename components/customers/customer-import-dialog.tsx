"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, Loader2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { customerStages } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import type { CustomerInput } from "@/lib/validations";
import type { CompanyType, CustomerGrade, CustomerStage } from "@/types/crm";

type ImportRow = CustomerInput & {
  rowNumber: number;
  errors: string[];
};

const templateHeaders = [
  "公司名称",
  "联系人",
  "国家",
  "行业",
  "公司类型",
  "WhatsApp",
  "邮箱",
  "来源",
  "客户等级",
  "当前阶段",
  "备注"
];

const headerMap: Record<string, keyof CustomerInput> = {
  company_name: "company_name",
  company: "company_name",
  公司名称: "company_name",
  公司: "company_name",
  contact_name: "contact_name",
  contact: "contact_name",
  联系人: "contact_name",
  country: "country",
  国家: "country",
  industry: "industry",
  行业: "industry",
  company_type: "company_type",
  type: "company_type",
  公司类型: "company_type",
  whatsapp: "whatsapp",
  WhatsApp: "whatsapp",
  email: "email",
  邮箱: "email",
  source: "source",
  来源: "source",
  grade: "grade",
  客户等级: "grade",
  等级: "grade",
  stage: "stage",
  当前阶段: "stage",
  阶段: "stage",
  notes: "notes",
  备注: "notes"
};

const stageLabelMap = new Map<string, CustomerStage>(
  customerStages.flatMap((stage) => [
    [stage.value, stage.value],
    [stage.label, stage.value]
  ])
);

const companyTypeMap = new Map<string, CompanyType>([
  ["manufacturer", "manufacturer"],
  ["工厂", "manufacturer"],
  ["制造商", "manufacturer"],
  ["trader", "trader"],
  ["贸易商", "trader"],
  ["brand", "brand"],
  ["品牌", "brand"],
  ["retailer", "retailer"],
  ["零售商", "retailer"],
  ["other", "other"],
  ["其他", "other"]
]);

export function CustomerImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => parseImportRows(rawText), [rawText]);
  const validRows = rows.filter((row) => row.errors.length === 0);
  const errorCount = rows.length - validRows.length;

  async function importCustomers() {
    if (!validRows.length) return;
    setLoading(true);
    const response = await fetch("/api/customers/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customers: validRows.map(({ rowNumber: _rowNumber, errors: _errors, ...customer }) => customer)
      })
    });
    setLoading(false);

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast({
        title: "导入失败",
        description: payload?.error ?? "请检查文件内容后重试。",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "客户已导入",
      description: `成功导入 ${payload?.count ?? validRows.length} 个客户。`
    });
    setRawText("");
    setOpen(false);
    router.refresh();
  }

  async function readFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setRawText(text);
  }

  function downloadTemplate() {
    const sample = [
      templateHeaders.join(","),
      [
        "PT Comfort Living Indonesia",
        "Budi Santoso",
        "Indonesia",
        "Furniture",
        "manufacturer",
        "+62 812 8800 1020",
        "budi@example.com",
        "WhatsApp",
        "A",
        "已报价",
        "需要 30D 高回弹海绵样品"
      ].join(",")
    ].join("\n");
    const blob = new Blob(["\ufeff", sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "homy-customers-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          快速导入
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>快速导入客户</DialogTitle>
          <DialogDescription>支持 CSV 文件或从 Excel 复制粘贴，导入前可预览客户数据。</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList>
            <TabsTrigger value="upload">上传 CSV</TabsTrigger>
            <TabsTrigger value="paste">粘贴表格</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="customer-import-file">选择文件</Label>
              <Input
                id="customer-import-file"
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={(event) => readFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="button" variant="ghost" onClick={downloadTemplate}>
              <Download />
              下载导入模板
            </Button>
          </TabsContent>
          <TabsContent value="paste" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="customer-import-paste">客户数据</Label>
              <Textarea
                id="customer-import-paste"
                className="min-h-48 font-mono text-xs"
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder="公司名称,联系人,国家,行业,公司类型,WhatsApp,邮箱,来源,客户等级,当前阶段,备注"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={validRows.length ? "success" : "secondary"}>{validRows.length} 可导入</Badge>
            <Badge variant={errorCount ? "destructive" : "secondary"}>{errorCount} 有错误</Badge>
          </div>
          <Button onClick={importCustomers} disabled={!validRows.length || loading}>
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            确认导入
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">行</TableHead>
                <TableHead>公司名称</TableHead>
                <TableHead>联系人</TableHead>
                <TableHead>国家</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>等级</TableHead>
                <TableHead>阶段</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.slice(0, 8).map((row) => (
                  <TableRow key={row.rowNumber}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell className="font-medium">{row.company_name}</TableCell>
                    <TableCell>{row.contact_name || "-"}</TableCell>
                    <TableCell>{row.country || "-"}</TableCell>
                    <TableCell>{row.source || "-"}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{customerStages.find((stage) => stage.value === row.stage)?.label ?? row.stage}</TableCell>
                    <TableCell>
                      {row.errors.length ? (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="size-3" />
                          {row.errors.join("；")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="size-3" />
                          可导入
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    上传或粘贴客户数据后显示预览
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function parseImportRows(rawText: string): ImportRow[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitLine(lines[0], delimiter).map((header) => header.trim());
  const mappedHeaders = headers.map((header) => headerMap[header] ?? headerMap[header.toLowerCase()]);

  return lines.slice(1).map((line, index) => {
    const cells = splitLine(line, delimiter);
    const row: Partial<CustomerInput> = {};

    mappedHeaders.forEach((field, cellIndex) => {
      if (!field) return;
      const value = cells[cellIndex]?.trim();
      if (value) {
        (row as Record<string, string>)[field] = value;
      }
    });

    const grade = normalizeGrade(row.grade);
    const stage = normalizeStage(row.stage);
    const companyType = normalizeCompanyType(row.company_type);
    const errors: string[] = [];

    if (!row.company_name || row.company_name.length < 2) errors.push("缺少公司名称");
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push("邮箱格式错误");

    return {
      rowNumber: index + 2,
      company_name: row.company_name ?? "",
      contact_name: row.contact_name ?? "",
      country: row.country ?? "",
      industry: row.industry ?? "",
      company_type: companyType,
      whatsapp: row.whatsapp ?? "",
      email: row.email ?? "",
      source: row.source ?? "Import",
      grade,
      stage,
      notes: row.notes ?? "",
      errors
    };
  });
}

function splitLine(line: string, delimiter: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  result.push(current);
  return result;
}

function normalizeGrade(value: unknown): CustomerGrade {
  const grade = String(value ?? "B").toUpperCase();
  return grade === "A" || grade === "B" || grade === "C" ? grade : "B";
}

function normalizeStage(value: unknown): CustomerStage {
  return stageLabelMap.get(String(value ?? "").trim()) ?? "new_inquiry";
}

function normalizeCompanyType(value: unknown): CompanyType | null {
  const key = String(value ?? "").trim();
  return companyTypeMap.get(key) ?? companyTypeMap.get(key.toLowerCase()) ?? null;
}
