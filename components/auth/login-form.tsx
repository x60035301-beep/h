"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { withLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const setupCopy = {
  zh: {
    title: "生产配置缺失",
    description: "正式登录前必须在 .env.local 或 Vercel 环境变量中配置 Supabase。",
    command: "配置后运行：pnpm env:check",
    variables: "必填：NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY、SUPABASE_SECRET_KEY"
  },
  en: {
    title: "Production configuration missing",
    description: "Supabase must be configured in .env.local or Vercel environment variables before sign-in.",
    command: "After configuration run: pnpm env:check",
    variables: "Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY"
  },
  id: {
    title: "Konfigurasi produksi belum lengkap",
    description: "Supabase harus diisi di .env.local atau environment variable Vercel sebelum login.",
    command: "Setelah konfigurasi jalankan: pnpm env:check",
    variables: "Wajib: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY"
  }
} as const;

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dictionary = getDictionary(locale);
  const supabaseConfigured = hasSupabaseEnv();
  const setup = setupCopy[locale];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const supabase = createClient();

    if (!supabase) {
      toast({
        title: dictionary.auth.missingEnvTitle,
        description: dictionary.auth.missingEnvDescription,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: dictionary.auth.loginFailed, description: error.message, variant: "destructive" });
      return;
    }

    router.push(withLocale("/dashboard", locale));
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {!supabaseConfigured ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">{setup.title}</p>
              <p className="text-destructive/85">{setup.description}</p>
              <p className="text-xs text-destructive/80">{setup.variables}</p>
              <code className="block rounded bg-background/80 px-2 py-1 text-xs text-foreground">{setup.command}</code>
            </div>
          </div>
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="email">{dictionary.auth.email}</Label>
        <Input id="email" name="email" type="email" placeholder="sales@homyfoam.co.id" required />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">{dictionary.auth.password}</Label>
          <Link className="text-xs text-primary hover:underline" href={withLocale("/reset-password", locale)}>
            {dictionary.auth.forgotPassword}
          </Link>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" disabled={loading || !supabaseConfigured}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {dictionary.auth.signIn}
      </Button>
    </form>
  );
}
