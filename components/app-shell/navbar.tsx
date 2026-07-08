import { Bell, Search } from "lucide-react";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDictionary } from "@/lib/dictionaries";
import type { SessionProfile } from "@/lib/permissions";
import type { Locale } from "@/types/crm";

export function Navbar({ locale, profile }: { locale: Locale; profile: SessionProfile }) {
  const dictionary = getDictionary(locale);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MobileNav locale={locale} />
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder={dictionary.topbar.searchPlaceholder} />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={dictionary.topbar.notifications}>
            <Bell />
          </Button>
          <LocaleSwitcher locale={locale} />
          <ThemeToggle locale={locale} />
          <UserMenu locale={locale} profile={profile} />
        </div>
      </div>
    </header>
  );
}
