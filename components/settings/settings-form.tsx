"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  ImageIcon,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Upload
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import type { CompanySettings, Locale } from "@/types/crm";

const copy = {
  zh: {
    overview: "设置总览",
    companyProfile: "公司档案",
    brandIdentity: "品牌识别",
    contacts: "联系信息",
    operations: "系统状态",
    previewTitle: "工作台品牌预览",
    previewDescription: "登录页、报价单、邮件模板和内部页面将优先使用这些公司信息。",
    fallbackCompany: "HOMY Sponge Factory",
    logo: "Logo",
    logoUrl: "Logo URL",
    logoUrlHint: "可粘贴图片地址，也可以直接上传 Logo 文件。",
    uploadLogo: "上传 Logo",
    uploadingLogo: "上传中",
    logoUploaded: "Logo 已上传",
    logoUploadFailed: "Logo 上传失败",
    logoUnsupported: "请选择图片文件作为 Logo",
    openLogo: "查看 Logo",
    companyName: "公司名称",
    companyNameHint: "用于系统顶部、报价文件和客户沟通内容。",
    phone: "联系电话",
    email: "邮箱",
    address: "地址",
    addressHint: "建议填写完整工厂或办公室地址，方便报价单和合同引用。",
    systemLanguage: "多语言",
    systemLanguageValue: "中文 / English / Bahasa Indonesia",
    security: "权限与安全",
    securityValue: "Supabase Auth + RBAC",
    storage: "文件上传",
    storageValue: "PDF / 图片 / 视频",
    aiReady: "AI 扩展",
    aiReadyValue: "OpenRouter 接口已预留",
    active: "启用",
    required: "必填",
    saved: "公司设置已保存",
    saveFailed: "设置保存失败",
    save: "保存设置",
    saving: "保存中",
    unsaved: "有未保存修改",
    synced: "已同步",
    formError: "请检查表单内容",
    configured: "已配置",
    missing: "待完善"
  },
  en: {
    overview: "Settings Overview",
    companyProfile: "Company Profile",
    brandIdentity: "Brand Identity",
    contacts: "Contact Details",
    operations: "System Status",
    previewTitle: "Workspace Brand Preview",
    previewDescription: "Login, quotations, email templates, and internal pages use this company profile first.",
    fallbackCompany: "HOMY Sponge Factory",
    logo: "Logo",
    logoUrl: "Logo URL",
    logoUrlHint: "Paste an image URL or upload a logo file directly.",
    uploadLogo: "Upload Logo",
    uploadingLogo: "Uploading",
    logoUploaded: "Logo uploaded",
    logoUploadFailed: "Logo upload failed",
    logoUnsupported: "Choose an image file for the logo",
    openLogo: "Open Logo",
    companyName: "Company Name",
    companyNameHint: "Used in the navbar, quotation files, and customer communications.",
    phone: "Phone",
    email: "Email",
    address: "Address",
    addressHint: "Use the full factory or office address for quotations and contracts.",
    systemLanguage: "Languages",
    systemLanguageValue: "Chinese / English / Bahasa Indonesia",
    security: "Permissions & Security",
    securityValue: "Supabase Auth + RBAC",
    storage: "File Uploads",
    storageValue: "PDF / Images / Videos",
    aiReady: "AI Extension",
    aiReadyValue: "OpenRouter interface reserved",
    active: "Active",
    required: "Required",
    saved: "Company settings saved",
    saveFailed: "Settings save failed",
    save: "Save Settings",
    saving: "Saving",
    unsaved: "Unsaved changes",
    synced: "Synced",
    formError: "Check the form content",
    configured: "Configured",
    missing: "Incomplete"
  },
  id: {
    overview: "Ringkasan Pengaturan",
    companyProfile: "Profil Perusahaan",
    brandIdentity: "Identitas Brand",
    contacts: "Kontak",
    operations: "Status Sistem",
    previewTitle: "Pratinjau Brand Workspace",
    previewDescription: "Login, quotation, template email, dan halaman internal memakai profil perusahaan ini.",
    fallbackCompany: "HOMY Sponge Factory",
    logo: "Logo",
    logoUrl: "URL Logo",
    logoUrlHint: "Tempel URL gambar atau upload file logo langsung.",
    uploadLogo: "Upload Logo",
    uploadingLogo: "Uploading",
    logoUploaded: "Logo sudah diupload",
    logoUploadFailed: "Upload logo gagal",
    logoUnsupported: "Pilih file gambar untuk logo",
    openLogo: "Buka Logo",
    companyName: "Nama Perusahaan",
    companyNameHint: "Dipakai di navbar, file quotation, dan komunikasi pelanggan.",
    phone: "Telepon",
    email: "Email",
    address: "Alamat",
    addressHint: "Gunakan alamat pabrik atau kantor lengkap untuk quotation dan kontrak.",
    systemLanguage: "Bahasa",
    systemLanguageValue: "中文 / English / Bahasa Indonesia",
    security: "Izin & Keamanan",
    securityValue: "Supabase Auth + RBAC",
    storage: "Upload File",
    storageValue: "PDF / Gambar / Video",
    aiReady: "Ekstensi AI",
    aiReadyValue: "Interface OpenRouter tersedia",
    active: "Aktif",
    required: "Wajib",
    saved: "Pengaturan perusahaan disimpan",
    saveFailed: "Pengaturan gagal disimpan",
    save: "Simpan Pengaturan",
    saving: "Menyimpan",
    unsaved: "Perubahan belum disimpan",
    synced: "Tersinkron",
    formError: "Periksa isi formulir",
    configured: "Terkonfigurasi",
    missing: "Belum lengkap"
  }
} as const;

type UploadResponse = {
  data?: {
    file_url?: string;
  };
  error?: string;
  message?: string;
};

export function SettingsForm({ settings, locale = "zh" }: { settings: CompanySettings; locale?: Locale }) {
  const router = useRouter();
  const page = copy[locale];
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: normalizeSettings(settings)
  });

  const watchedValues = useWatch({ control: form.control });
  const preview = useMemo(
    () => ({
      ...form.getValues(),
      ...watchedValues
    }),
    [form, watchedValues]
  );

  const companyName = preview.company_name?.trim() || page.fallbackCompany;
  const logoUrl = preview.logo_url?.trim() || "";
  const completionItems = [
    Boolean(companyName),
    Boolean(logoUrl),
    Boolean(preview.phone?.trim()),
    Boolean(preview.email?.trim()),
    Boolean(preview.address?.trim())
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  async function onSubmit(values: SettingsInput) {
    setSaving(true);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizeInput(values))
    });
    setSaving(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      toast({
        title: page.saveFailed,
        description: result?.error ?? result?.message,
        variant: "destructive"
      });
      return;
    }

    const cleanValues = normalizeInput(values);
    form.reset(cleanValues);
    toast({ title: page.saved });
    router.refresh();
  }

  async function onLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: page.logoUnsupported, variant: "destructive" });
      return;
    }

    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/attachments", {
      method: "POST",
      body: formData
    });
    const result = (await response.json().catch(() => null)) as UploadResponse | null;
    setLogoUploading(false);

    if (!response.ok || !result?.data?.file_url) {
      toast({
        title: page.logoUploadFailed,
        description: result?.error ?? result?.message,
        variant: "destructive"
      });
      return;
    }

    setLogoFailed(false);
    form.setValue("logo_url", result.data.file_url, { shouldDirty: true, shouldValidate: true });
    toast({ title: page.logoUploaded });
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{page.overview}</CardTitle>
                <CardDescription>{completion}% {page.configured}</CardDescription>
              </div>
              <Badge variant={form.formState.isDirty ? "warning" : "success"}>
                {form.formState.isDirty ? page.unsaved : page.synced}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <BrandPreview
              companyName={companyName}
              logoUrl={logoUrl}
              logoFailed={logoFailed}
              setLogoFailed={setLogoFailed}
              description={page.previewDescription}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{page.companyProfile}</span>
                <span>{completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.operations}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow icon={<Languages />} label={page.systemLanguage} value={page.systemLanguageValue} badge={page.active} />
            <StatusRow icon={<ShieldCheck />} label={page.security} value={page.securityValue} badge={page.active} />
            <StatusRow icon={<ImageIcon />} label={page.storage} value={page.storageValue} badge={page.active} />
            <StatusRow icon={<Globe2 />} label={page.aiReady} value={page.aiReadyValue} badge={page.active} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{page.brandIdentity}</CardTitle>
                <CardDescription>{page.previewTitle}</CardDescription>
              </div>
              <Badge variant="outline">{page.required}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-5">
                <LogoBox
                  companyName={companyName}
                  logoUrl={logoUrl}
                  logoFailed={logoFailed}
                  setLogoFailed={setLogoFailed}
                  size="large"
                />
              </div>
              <div className="grid gap-4">
                <Field
                  label={page.logoUrl}
                  htmlFor="logo_url"
                  error={form.formState.errors.logo_url?.message}
                  description={page.logoUrlHint}
                >
                  <Input id="logo_url" placeholder="https://..." {...form.register("logo_url")} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button asChild type="button" variant="outline" size="sm" disabled={logoUploading}>
                    <Label htmlFor="logo_file" className="cursor-pointer">
                      {logoUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                      {logoUploading ? page.uploadingLogo : page.uploadLogo}
                    </Label>
                  </Button>
                  <Input id="logo_file" className="hidden" type="file" accept="image/*" onChange={onLogoFileChange} />
                  {logoUrl ? (
                    <Button asChild type="button" variant="outline" size="sm">
                      <a href={logoUrl} target="_blank" rel="noreferrer">
                        <ExternalLink />
                        {page.openLogo}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            <Field
              label={page.companyName}
              htmlFor="company_name"
              error={form.formState.errors.company_name?.message}
              description={page.companyNameHint}
            >
              <Input id="company_name" {...form.register("company_name")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.contacts}</CardTitle>
            <CardDescription>{page.addressHint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <IconField icon={<Phone />} label={page.phone} htmlFor="phone" error={form.formState.errors.phone?.message}>
                <Input id="phone" {...form.register("phone")} />
              </IconField>
              <IconField icon={<Mail />} label={page.email} htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" {...form.register("email")} />
              </IconField>
            </div>
            <IconField icon={<MapPin />} label={page.address} htmlFor="address" error={form.formState.errors.address?.message}>
              <Textarea id="address" className="min-h-28 resize-y" {...form.register("address")} />
            </IconField>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {form.formState.isDirty ? <Globe2 className="size-4 text-amber-600" /> : <CheckCircle2 className="size-4 text-emerald-600" />}
            <span>{form.formState.isDirty ? page.unsaved : page.synced}</span>
          </div>
          <Button type="submit" disabled={saving || logoUploading}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? page.saving : page.save}
          </Button>
        </div>
      </div>
    </form>
  );
}

function BrandPreview({
  companyName,
  logoUrl,
  logoFailed,
  setLogoFailed,
  description
}: {
  companyName: string;
  logoUrl: string;
  logoFailed: boolean;
  setLogoFailed: (value: boolean) => void;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <LogoBox companyName={companyName} logoUrl={logoUrl} logoFailed={logoFailed} setLogoFailed={setLogoFailed} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{companyName}</p>
          <p className="text-xs text-muted-foreground">HOMY AI Sales CRM</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function LogoBox({
  companyName,
  logoUrl,
  logoFailed,
  setLogoFailed,
  size = "normal"
}: {
  companyName: string;
  logoUrl: string;
  logoFailed: boolean;
  setLogoFailed: (value: boolean) => void;
  size?: "normal" | "large";
}) {
  const initials = getInitials(companyName);
  const dimension = size === "large" ? "size-24" : "size-12";

  return (
    <div className={`${dimension} flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background shadow-sm`}>
      {logoUrl && !logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={`${companyName} logo`} className="h-full w-full object-contain p-2" onError={() => setLogoFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">{initials}</div>
      )}
    </div>
  );
}

function StatusRow({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
      <Badge variant="success" className="shrink-0">
        {badge}
      </Badge>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  description,
  error,
  children
}: {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description ? <p className="text-xs leading-5 text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function IconField({
  icon,
  label,
  htmlFor,
  error,
  children
}: {
  icon: React.ReactNode;
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function normalizeSettings(settings: CompanySettings): SettingsInput {
  return {
    logo_url: settings.logo_url ?? "",
    company_name: settings.company_name,
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? ""
  };
}

function normalizeInput(values: SettingsInput): SettingsInput {
  return {
    logo_url: values.logo_url ?? "",
    company_name: values.company_name,
    phone: values.phone ?? "",
    email: values.email ?? "",
    address: values.address ?? ""
  };
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
