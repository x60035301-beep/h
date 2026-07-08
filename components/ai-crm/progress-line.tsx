import Link from "next/link";

import { cn } from "@/lib/utils";

export function ProgressLine({
  value,
  label,
  className
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{normalized}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

export function StageRail({
  steps,
  progress,
  getHref
}: {
  steps: readonly string[];
  progress: number;
  getHref?: (step: string, index: number) => string;
}) {
  const completedIndex = Math.floor((Math.min(100, Math.max(0, progress)) / 100) * steps.length);

  return (
    <div className="grid gap-2">
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-9">
        {steps.map((step, index) => {
          const done = index < completedIndex;
          const active = index === completedIndex;
          const href = getHref?.(step, index);
          const content = (
            <>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    active && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <span className="break-words font-medium">{step}</span>
              </div>
              {href ? <span className="text-[11px] text-muted-foreground group-hover:text-primary">查看内部</span> : null}
            </>
          );
          const className = cn(
            "group min-h-16 rounded-md border p-2 text-xs transition",
            href && "block hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            done && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
            active && "border-primary/40 bg-accent text-accent-foreground"
          );

          return href ? (
            <Link key={step} href={href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={step} className={className}>
              {content}
            </div>
          );
        })}
      </div>
      <ProgressLine value={progress} />
    </div>
  );
}
