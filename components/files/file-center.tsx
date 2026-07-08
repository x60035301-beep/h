"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, File, ImageIcon, Loader2, Upload, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { Attachment, CustomerSummary, Locale } from "@/types/crm";

const GENERAL_VALUE = "__general__";

const icons = {
  pdf: File,
  image: ImageIcon,
  video: Video,
  other: File
};

const copy = {
  zh: {
    title: "上传文件",
    customer: "关联客户",
    general: "通用文件",
    upload: "上传",
    uploading: "上传中",
    uploaded: "文件已上传",
    failed: "上传失败",
    unsupported: "请选择 PDF、图片或视频文件",
    preview: "下载 / 预览",
    empty: "暂无附件"
  },
  en: {
    title: "Upload file",
    customer: "Linked customer",
    general: "General file",
    upload: "Upload",
    uploading: "Uploading",
    uploaded: "File uploaded",
    failed: "Upload failed",
    unsupported: "Choose a PDF, image, or video file",
    preview: "Download / Preview",
    empty: "No attachments"
  },
  id: {
    title: "Upload file",
    customer: "Pelanggan terkait",
    general: "File umum",
    upload: "Upload",
    uploading: "Uploading",
    uploaded: "File sudah diupload",
    failed: "Upload gagal",
    unsupported: "Pilih file PDF, gambar, atau video",
    preview: "Download / Preview",
    empty: "Belum ada lampiran"
  }
} as const;

export function FileCenter({
  attachments,
  customers,
  locale = "zh"
}: {
  attachments: Attachment[];
  customers: CustomerSummary[];
  locale?: Locale;
}) {
  const router = useRouter();
  const page = copy[locale];
  const [file, setFile] = useState<File | null>(null);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? GENERAL_VALUE);
  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  async function upload() {
    if (!file) return;

    if (!isSupportedFile(file)) {
      toast({ title: page.unsupported, variant: "destructive" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (customerId !== GENERAL_VALUE) formData.append("customer_id", customerId);

    const response = await fetch("/api/attachments", {
      method: "POST",
      body: formData
    });

    setLoading(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      toast({
        title: page.failed,
        description: result?.error ?? result?.message,
        variant: "destructive"
      });
      return;
    }

    setFile(null);
    setInputKey((current) => current + 1);
    toast({ title: page.uploaded });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{page.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_240px_auto]">
          <Input
            key={inputKey}
            type="file"
            accept="application/pdf,image/*,video/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder={page.customer} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GENERAL_VALUE}>{page.general}</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={upload} disabled={!file || loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Upload />}
            {loading ? page.uploading : page.upload}
          </Button>
        </CardContent>
      </Card>

      {attachments.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {attachments.map((attachment) => {
            const Icon = icons[attachment.file_type];
            return (
              <Card key={attachment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-5 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{attachment.file_name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(attachment.created_at, "yyyy-MM-dd HH:mm", locale)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{attachment.file_type}</Badge>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <a href={attachment.file_url} target="_blank" rel="noreferrer">
                      <Download />
                      {page.preview}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {page.empty}
        </div>
      )}
    </div>
  );
}

function isSupportedFile(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}
