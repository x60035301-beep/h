"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory } from "lucide-react";

import { getNavigationLabel, navigationItems } from "@/config/navigation";
import { appName, appVersion } from "@/config/crm";
import { useNavigationProgress } from "@/components/app-shell/navigation-progress";
import { getDictionary } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/crm";

export function Sidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const { startNavigation } = useNavigationProgress();
  const dictionary = getDictionary(locale);

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground lg:block">
      <Link href={`/${locale}/dashboard`} className="mb-6 flex items-center gap-3 rounded-md px-3 py-2">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Factory className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{appName}</span>
          <span className="block text-xs text-muted-foreground">{appVersion}</span>
        </span>
      </Link>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              prefetch
              onClick={() => {
                if (!active) startNavigation();
              }}
              className={cn(
                "group relative flex h-9 items-center gap-3 overflow-hidden rounded-md px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent font-medium text-accent-foreground"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-all duration-200",
                  active && "opacity-100"
                )}
              />
              <Icon className="size-4" />
              <span className="truncate">{getNavigationLabel(item, locale, dictionary.nav[item.key])}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
