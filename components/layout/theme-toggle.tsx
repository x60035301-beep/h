"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/types/crm";

export function ThemeToggle({ locale }: { locale: Locale }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const dictionary = getDictionary(locale);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={dictionary.topbar.toggleTheme}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dictionary.topbar.toggleTheme}</TooltipContent>
    </Tooltip>
  );
}
