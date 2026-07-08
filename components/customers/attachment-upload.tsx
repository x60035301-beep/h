"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Locale } from "@/types/crm";

const copy = {
  zh: {
    upload: "上传附件",
    uploading: "上传中",
    uploaded: "附件已上传",
    failed: "上传失败",
    unsupported: "请选择 PDF、图片或视频文件"
  },
  en: {
    upload: "Upload attachment",
    uploading: "Uploading",
    uploaded: "Attachment uploaded",
    failed: "Upload failed",
    unsupported: "Choose a PDF, image, or video file"
  },
  id: {
    upload: "Upload lampiran",
    uploading: "Uploading",
    uploaded: "Lampiran sudah diupload",
    failed: "Upload gagal",
    unsupported: "Pilih file PDF, gambar, atau video"
  }
} as const;

export function AttachmentUpload({ customerId, locale = "zh" }: { customerId: string; locale?: Locale }) {
  const router = useRouter();
  const page = copy[locale];
  const [file, setFile] = useState<File | null>(null);
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
    formData.append("customer_id", customerId);

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
    <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center">
      <Input
        key={inputKey}
        type="file"
        accept="application/pdf,image/*,video/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <Button onClick={upload} disabled={!file || loading} type="button">
        {loading ? <Loader2 className="animate-spin" /> : <Upload />}
        {loading ? page.uploading : page.upload}
      </Button>
    </div>
  );
}

function isSupportedFile(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}
