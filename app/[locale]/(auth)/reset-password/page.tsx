import { ResetPasswordForm } from "@/components/auth/password-forms";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">{dictionary.auth.resetTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{dictionary.auth.resetDescription}</p>
        <div className="mt-6">
          <ResetPasswordForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
