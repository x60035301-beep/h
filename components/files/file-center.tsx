"use client";

import { useState } from "react";
import { Download, File, ImageIcon, Upload, Video } from "lucide-react";

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
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Attachment, CustomerSummary } from "@/types/crm";

const icons = {
  pdf: File,
  image: ImageIcon,
  video: Video,
  other: File
};

export function FileCenter({ attachments, customers }: { attachments: Attachment[]; customers: CustomerSummary[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    const supabase = createClient();
    if (!supabase) {
      setLoading(true);
      const localUrl = URL.createObjectURL(file);
      const response = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId || null,
          file_name: file.name,
          file_url: localUrl,
          storage_path: null,
          file_type: file.type.includes("image") ? "image" : file.type.includes("video") ? "video" : file.type.includes("pdf") ? "pdf" : "other",
          size_bytes: file.size
        })
      });
      setLoading(false);
      if (!response.ok) {
        toast({ title: "Upload failed", variant: "destructive" });
        return;
      }
      setFile(null);
      toast({ title: "File uploaded" });
      return;
    }

    setLoading(true);
    const path = `${customerId || "general"}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file);
    if (error) {
      setLoading(false);
      toast({ title: "上传失败", description: error.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("attachments").getPublicUrl(path);
    await fetch("/api/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId || null,
        file_name: file.name,
        file_url: data.publicUrl,
        storage_path: path,
        file_type: file.type.includes("image") ? "image" : file.type.includes("video") ? "video" : file.type.includes("pdf") ? "pdf" : "other",
        size_bytes: file.size
      })
    });
    setLoading(false);
    toast({ title: "文件已上传" });
    location.reload();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>上传文件</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_240px_auto]">
          <Input type="file" accept="application/pdf,image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="关联客户" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={upload} disabled={!file || loading}>
            <Upload />
            上传
          </Button>
        </CardContent>
      </Card>

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
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(attachment.created_at)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{attachment.file_type}</Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <a href={attachment.file_url} target="_blank">
                    <Download />
                    下载 / 预览
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
