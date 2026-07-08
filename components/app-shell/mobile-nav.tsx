"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { getNavigationLabel, navigationItems } from "@/config/navigation";
import { appName } from "@/config/crm";
import { useNavigationProgress } from "@/components/app-shell/navigation-progress";
import { getDictionary } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/crm";

export function MobileNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { startNavigation } = useNavigationProgress();
  const dictionary = getDictionary(locale);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={dictionary.topbar.openNavigation}>
          <Menu />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{appName}</DrawerTitle>
        </DrawerHeader>
        <nav className="grid gap-1 px-4 pb-6">
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
                  setOpen(false);
                }}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                  active && "bg-accent font-medium text-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                {getNavigationLabel(item, locale, dictionary.nav[item.key])}
              </Link>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
