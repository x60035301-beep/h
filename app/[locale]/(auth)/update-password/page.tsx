import { UpdatePasswordForm } from "@/components/auth/password-forms";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function UpdatePasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">{dictionary.auth.updateTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{dictionary.auth.updateDescription}</p>
        <div className="mt-6">
          <UpdatePasswordForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
