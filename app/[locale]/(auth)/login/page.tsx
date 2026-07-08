import { Factory } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { appName, appVersion } from "@/config/crm";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-zinc-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary">
            <Factory className="size-5" />
          </span>
          <div>
            <p className="font-semibold">{appName}</p>
            <p className="text-xs text-zinc-400">{appVersion}</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm uppercase text-blue-300">{dictionary.auth.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal">{dictionary.auth.headline}</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{dictionary.auth.description}</p>
        </div>
        <p className="text-xs text-zinc-500">{dictionary.auth.aiNote}</p>
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Factory className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{appName}</p>
                <p className="text-xs text-muted-foreground">{appVersion}</p>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold">{dictionary.auth.signInTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dictionary.auth.signInDescription}</p>
          <div className="mt-6">
            <LoginForm locale={locale} />
          </div>
        </div>
      </section>
    </main>
  );
}
