"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { withLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(false);
  const dictionary = getDictionary(locale);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const email = String(new FormData(event.currentTarget).get("email"));
    let error: string | undefined;
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) error = result.error ?? dictionary.auth.resetFailed;
    } catch {
      error = dictionary.auth.resetFailed;
    } finally {
      setLoading(false);
    }
    toast({
      title: error ? dictionary.auth.resetFailed : dictionary.auth.resetSuccessTitle,
      description: error ?? dictionary.auth.resetSuccessDescription,
      variant: error ? "destructive" : "default"
    });
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">{dictionary.auth.email}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {dictionary.auth.sendResetLink}
      </Button>
    </form>
  );
}

export function UpdatePasswordForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dictionary = getDictionary(locale);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const password = String(new FormData(event.currentTarget).get("password"));
    let error: string | undefined;
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) error = result.error ?? dictionary.auth.updateFailed;
    } catch {
      error = dictionary.auth.updateFailed;
    } finally {
      setLoading(false);
    }
    if (error) {
      toast({ title: dictionary.auth.updateFailed, description: error, variant: "destructive" });
      return;
    }
    toast({ title: dictionary.auth.updateSuccess });
    router.push(withLocale("/dashboard", locale));
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="password">{dictionary.auth.newPassword}</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {dictionary.auth.updatePassword}
      </Button>
    </form>
  );
}
