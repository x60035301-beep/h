import { redirect } from "next/navigation";

import { defaultLocale, isLocale, withLocale } from "@/lib/i18n";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  redirect(withLocale("/dashboard", locale));
}
