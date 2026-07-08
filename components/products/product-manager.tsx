"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/lib/validations";
import type { Product } from "@/types/crm";

export function ProductManager({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>产品列表</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus />
              新增产品
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editing ? "编辑产品" : "新增产品"}</DialogTitle>
              <DialogDescription>维护产品图片、规格、密度、尺寸、价格、库存和资料链接。</DialogDescription>
            </DialogHeader>
            <ProductForm product={editing ?? undefined} onSaved={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[92px]">图片</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>规格</TableHead>
                <TableHead>密度</TableHead>
                <TableHead>尺寸</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>库存</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <ProductImage product={product} className="size-14" />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category_name ?? "-"}</TableCell>
                  <TableCell>{product.specification ?? "-"}</TableCell>
                  <TableCell>{product.density ?? "-"}</TableCell>
                  <TableCell>{product.size ?? "-"}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock ?? "预留"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(product);
                          setOpen(true);
                        }}
                        aria-label="编辑产品"
                      >
                        <Edit />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} aria-label="删除产品">
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductForm({ product, onSaved }: { product?: Product; onSaved?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name ?? "",
      category_id: product?.category_id ?? null,
      specification: product?.specification ?? "",
      density: product?.density ?? "",
      size: product?.size ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? null,
      image_url: product?.image_url ?? "",
      pdf_url: product?.pdf_url ?? ""
    }
  });
  const imageUrl = useWatch({ control: form.control, name: "image_url" });
  const name = useWatch({ control: form.control, name: "name" });
  const previewProduct: Product = {
    id: product?.id ?? "preview",
    name: name || product?.name || "Foam product",
    category_id: product?.category_id ?? null,
    category_name: product?.category_name ?? null,
    specification: null,
    density: null,
    size: null,
    price: 0,
    stock: null,
    image_url: imageUrl || null,
    pdf_url: null
  };

  async function uploadImage(file: File | null) {
    if (!file) return;
    const supabase = createClient();
    if (!supabase) {
      toast({ title: "图片上传不可用", description: "请先配置 Supabase 环境变量。", variant: "destructive" });
      return;
    }

    setImageUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `products/${product?.id ?? "new"}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (error) {
      setImageUploading(false);
      toast({ title: "图片上传失败", description: error.message, variant: "destructive" });
      return;
    }

    const { data } = supabase.storage.from("attachments").getPublicUrl(path);
    form.setValue("image_url", data.publicUrl, { shouldDirty: true, shouldValidate: true });
    setImageUploading(false);
    toast({ title: "图片已上传", description: "保存产品后，图片会显示在产品列表中。" });
  }

  async function onSubmit(values: ProductInput) {
    setLoading(true);
    const response = await fetch(product?.id ? `/api/products/${product.id}` : "/api/products", {
      method: product?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);
    if (!response.ok) {
      toast({ title: "产品保存失败", variant: "destructive" });
      return;
    }
    toast({ title: "产品已保存" });
    onSaved?.();
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[132px_1fr]">
        <ProductImage product={previewProduct} className="h-28 w-full sm:h-full" />
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>产品图片</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void uploadImage(file);
                  event.currentTarget.value = "";
                }}
              />
              <Button type="button" variant="outline" disabled={imageUploading}>
                {imageUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {imageUploading ? "上传中" : "上传图片"}
              </Button>
            </div>
          </div>
          <Field label="图片 URL">
            <Input {...form.register("image_url")} placeholder="上传后自动填入，或粘贴外部图片链接" />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="产品名称">
          <Input {...form.register("name")} />
        </Field>
        <Field label="规格">
          <Input {...form.register("specification")} />
        </Field>
        <Field label="密度">
          <Input {...form.register("density")} placeholder="30D" />
        </Field>
        <Field label="尺寸">
          <Input {...form.register("size")} placeholder="200 x 100 x 10 cm" />
        </Field>
        <Field label="价格">
          <Input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
        </Field>
        <Field label="库存（预留）">
          <Input type="number" {...form.register("stock", { valueAsNumber: true })} />
        </Field>
        <Field label="PDF 参数 URL">
          <Input {...form.register("pdf_url")} />
        </Field>
      </div>
      <Button type="submit" disabled={loading || imageUploading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        保存产品
      </Button>
    </form>
  );
}

async function deleteProduct(id: string) {
  const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!response.ok) {
    toast({ title: "删除失败", variant: "destructive" });
    return;
  }
  toast({ title: "产品已删除" });
  location.reload();
}

function ProductImage({ product, className }: { product: Pick<Product, "name" | "category_name" | "image_url">; className?: string }) {
  const [failed, setFailed] = useState(false);
  const fallback = getFallbackImage(product);
  const src = product.image_url && !failed ? product.image_url : fallback;

  return (
    <div className={`relative overflow-hidden rounded-md border bg-muted ${className ?? "size-14"}`}>
      <img
        src={src}
        alt={`${product.name} 图片`}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
      {!product.image_url ? (
        <span className="absolute right-1 top-1 rounded bg-background/85 p-1 text-muted-foreground shadow-sm">
          <ImageIcon className="size-3" />
        </span>
      ) : null}
    </div>
  );
}

function getFallbackImage(product: Pick<Product, "name" | "category_name">) {
  const text = `${product.category_name ?? ""} ${product.name}`.toLowerCase();
  if (text.includes("mattress") || text.includes("memory") || text.includes("床垫")) return "/product-images/mattress-foam.svg";
  if (text.includes("industrial") || text.includes("acoustic") || text.includes("packing") || text.includes("工业")) {
    return "/product-images/industrial-foam.svg";
  }
  if (text.includes("sofa") || text.includes("cushion") || text.includes("沙发")) return "/product-images/sofa-foam.svg";
  return "/product-images/default-foam.svg";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
