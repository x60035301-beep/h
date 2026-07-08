"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export function AttachmentUpload({ customerId }: { customerId: string }) {
  const [file, setFile] = useState<File | null>(null);
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
          customer_id: customerId,
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
    const path = `${customerId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file, { upsert: false });
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
        customer_id: customerId,
        file_name: file.name,
        file_url: data.publicUrl,
        storage_path: path,
        file_type: file.type.includes("image") ? "image" : file.type.includes("video") ? "video" : file.type.includes("pdf") ? "pdf" : "other",
        size_bytes: file.size
      })
    });
    setLoading(false);
    setFile(null);
    toast({ title: "文件已上传" });
    location.reload();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center">
      <Input
        type="file"
        accept="application/pdf,image/*,video/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <Button onClick={upload} disabled={!file || loading} type="button">
        <Upload />
        上传附件
      </Button>
    </div>
  );
}
