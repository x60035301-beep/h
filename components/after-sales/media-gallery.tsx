"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FileImage, Loader2, PlayCircle, Upload, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Locale } from "@/types/crm";

type LocalizedText = Record<Locale, string>;

export type AfterSalesMediaItem = {
  id: string;
  type: "image" | "video";
  title: LocalizedText;
  category: LocalizedText;
  url: string;
  thumbnail?: string;
  capturedAt: string;
  uploader: string;
  note: LocalizedText;
  duration?: string;
};

const copy = {
  zh: {
    title: "质检媒体",
    description: "按图片和视频分类查看售后证据、复检记录和解决方案确认材料。",
    all: "全部",
    images: "图片",
    videos: "视频",
    preview: "预览",
    open: "打开文件",
    uploader: "上传人",
    time: "时间",
    note: "备注",
    noMedia: "暂无该分类媒体",
    videoPreview: "视频预览",
    imagePreview: "图片预览"
    ,
    uploadTitle: "自定义上传",
    uploadDescription: "上传售后图片、视频、复检记录或解决方案确认材料。",
    file: "文件",
    category: "分类",
    mediaTitle: "标题",
    uploadNote: "备注",
    uploadButton: "上传媒体",
    uploading: "上传中",
    uploaded: "媒体已上传",
    uploadFailed: "上传失败",
    unsupported: "仅支持图片或视频文件",
    titlePlaceholder: "例如：外箱破损细节",
    categoryPlaceholder: "例如：包装照片 / 复检视频",
    notePlaceholder: "填写这张图片或视频说明"
  },
  en: {
    title: "Inspection media",
    description: "Review after-sales evidence, inspection records, and solution confirmation by image and video.",
    all: "All",
    images: "Images",
    videos: "Videos",
    preview: "Preview",
    open: "Open file",
    uploader: "Uploader",
    time: "Time",
    note: "Note",
    noMedia: "No media in this category",
    videoPreview: "Video preview",
    imagePreview: "Image preview",
    uploadTitle: "Custom upload",
    uploadDescription: "Upload after-sales images, videos, inspection records, or solution confirmation material.",
    file: "File",
    category: "Category",
    mediaTitle: "Title",
    uploadNote: "Note",
    uploadButton: "Upload media",
    uploading: "Uploading",
    uploaded: "Media uploaded",
    uploadFailed: "Upload failed",
    unsupported: "Only image or video files are supported",
    titlePlaceholder: "Example: carton damage detail",
    categoryPlaceholder: "Example: packaging photo / recheck video",
    notePlaceholder: "Describe this image or video"
  },
  id: {
    title: "Media inspeksi",
    description: "Lihat bukti after sales, record inspeksi, dan konfirmasi solusi berdasarkan gambar dan video.",
    all: "Semua",
    images: "Gambar",
    videos: "Video",
    preview: "Preview",
    open: "Buka file",
    uploader: "Uploader",
    time: "Waktu",
    note: "Catatan",
    noMedia: "Belum ada media untuk kategori ini",
    videoPreview: "Preview video",
    imagePreview: "Preview gambar",
    uploadTitle: "Upload custom",
    uploadDescription: "Upload gambar, video, record inspeksi, atau material konfirmasi solusi after sales.",
    file: "File",
    category: "Kategori",
    mediaTitle: "Judul",
    uploadNote: "Catatan",
    uploadButton: "Upload media",
    uploading: "Uploading",
    uploaded: "Media sudah diupload",
    uploadFailed: "Upload gagal",
    unsupported: "Hanya mendukung file gambar atau video",
    titlePlaceholder: "Contoh: detail kerusakan karton",
    categoryPlaceholder: "Contoh: foto packaging / video recheck",
    notePlaceholder: "Jelaskan gambar atau video ini"
  }
} as const;

export function AfterSalesMediaGallery({
  locale,
  caseId,
  media
}: {
  locale: Locale;
  caseId: string;
  media: readonly AfterSalesMediaItem[];
}) {
  const page = copy[locale];
  const [items, setItems] = useState<AfterSalesMediaItem[]>(() => [...media]);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [preview, setPreview] = useState<AfterSalesMediaItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const imagesCount = items.filter((item) => item.type === "image").length;
  const videosCount = items.filter((item) => item.type === "video").length;
  const visibleMedia = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.type === filter)),
    [filter, items]
  );

  async function uploadMedia() {
    if (!file) return;
    const type = getMediaType(file);
    if (!type) {
      toast({ title: page.unsupported, variant: "destructive" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/attachments", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setUploading(false);
      toast({ title: page.uploadFailed, description: result?.error ?? result?.message, variant: "destructive" });
      return;
    }

    const result = await response.json();
    const url = result?.data?.file_url ?? URL.createObjectURL(file);
    const mediaTitle = title.trim() || file.name;
    const mediaCategory = category.trim() || (type === "image" ? page.images : page.videos);
    const mediaNote = note.trim() || mediaTitle;
    const uploaded: AfterSalesMediaItem = {
      id: `upload-${Date.now()}`,
      type,
      title: toLocalized(mediaTitle),
      category: toLocalized(mediaCategory),
      url,
      capturedAt: formatNow(),
      uploader: "HOMY Admin",
      note: toLocalized(mediaNote),
      duration: type === "video" ? "--:--" : undefined
    };

    setItems((current) => [uploaded, ...current]);
    setFilter(type);
    setFile(null);
    setTitle("");
    setCategory("");
    setNote("");
    setUploading(false);
    toast({ title: page.uploaded, description: mediaTitle });
  }

  return (
    <>
      <Card id="after-sales-media" className="scroll-mt-24">
        <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{page.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>
          </div>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">{page.all} {items.length}</TabsTrigger>
              <TabsTrigger value="image">{page.images} {imagesCount}</TabsTrigger>
              <TabsTrigger value="video">{page.videos} {videosCount}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{page.uploadTitle}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{page.uploadDescription}</p>
              </div>
              <Button type="button" onClick={uploadMedia} disabled={!file || uploading}>
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading ? page.uploading : page.uploadButton}
              </Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
              <Field label={page.file}>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null;
                    setFile(selected);
                    if (selected && !title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
                  }}
                />
              </Field>
              <Field label={page.mediaTitle}>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={page.titlePlaceholder} />
              </Field>
              <Field label={page.category}>
                <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder={page.categoryPlaceholder} />
              </Field>
              <div className="lg:col-span-3">
                <Field label={page.uploadNote}>
                  <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={page.notePlaceholder} />
                </Field>
              </div>
            </div>
          </div>

          {visibleMedia.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {visibleMedia.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-lg border bg-card">
                  <button
                    type="button"
                    className="group relative block aspect-video w-full overflow-hidden bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setPreview(item)}
                  >
                    <MediaSurface item={item} locale={locale} />
                    <span className="absolute left-2 top-2">
                      <MediaBadge item={item} locale={locale} />
                    </span>
                    {item.type === "video" ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                        <PlayCircle className="size-12 drop-shadow" />
                      </span>
                    ) : null}
                    {item.duration ? (
                      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                        {item.duration}
                      </span>
                    ) : null}
                  </button>
                  <div className="space-y-3 p-3">
                    <div>
                      <h3 className="line-clamp-1 text-sm font-semibold">{item.title[locale]}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.note[locale]}</p>
                    </div>
                    <div className="grid gap-1 text-xs text-muted-foreground">
                      <Meta label={page.uploader} value={item.uploader} />
                      <Meta label={page.time} value={item.capturedAt} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setPreview(item)}>
                        {page.preview}
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" />
                          {page.open}
                        </a>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              {page.noMedia}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle>{preview.title[locale]}</DialogTitle>
                <DialogDescription>{preview.type === "video" ? page.videoPreview : page.imagePreview}</DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border bg-muted">
                <div className="relative aspect-video">
                  {preview.type === "video" ? (
                    <video
                      src={preview.url}
                      poster={preview.thumbnail}
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={preview.url}
                      alt={preview.title[locale]}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <Meta label={page.uploader} value={preview.uploader} />
                <Meta label={page.time} value={preview.capturedAt} />
                <Meta label={page.note} value={preview.note[locale]} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MediaSurface({ item, locale }: { item: AfterSalesMediaItem; locale: Locale }) {
  if (item.type === "video" && !item.thumbnail) {
    return <video src={item.url} muted preload="metadata" className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]" />;
  }

  return (
    <img
      src={item.thumbnail ?? item.url}
      alt={item.title[locale]}
      className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
    />
  );
}

function MediaBadge({ item, locale }: { item: AfterSalesMediaItem; locale: Locale }) {
  const Icon = item.type === "image" ? FileImage : Video;
  return (
    <Badge variant="secondary" className="gap-1 bg-background/90 shadow-sm">
      <Icon className="size-3" />
      {item.category[locale]}
    </Badge>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function getMediaType(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function toLocalized(value: string): LocalizedText {
  return { zh: value, en: value, id: value };
}

function formatNow() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  return `${date} ${time}`;
}
