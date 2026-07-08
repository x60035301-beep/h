import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { requireProfile } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const profile = await requireProfile(locale);

  return (
    <AppShell locale={locale} profile={profile}>
      {children}
    </AppShell>
  );
}
