import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center", className)}>
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
