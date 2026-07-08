import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default"
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "success" | "warning";
}) {
  const card = (
    <Card
      className={cn(
        "h-full transition",
        href && "cursor-pointer hover:border-primary/40 hover:shadow-soft focus-within:border-primary/50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-md bg-muted",
            tone === "success" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
            tone === "warning" && "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </Link>
  );
}
