"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell">
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm font-medium text-destructive">Something went wrong</p>
        <h1 className="mt-2 text-xl font-semibold">CRM page failed to load</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
      </div>
    </div>
  );
}
