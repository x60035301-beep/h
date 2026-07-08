"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigationProgress } from "@/components/app-shell/navigation-progress";
import { getDictionary } from "@/lib/dictionaries";
import { locales, stripLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const dictionary = getDictionary(locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={dictionary.topbar.changeLanguage}>
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => {
              if (item !== locale) startNavigation();
              router.push(`/${item}${stripLocale(pathname)}`);
            }}
            className={item === locale ? "font-semibold text-primary" : undefined}
          >
            {dictionary.languageNames[item]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
