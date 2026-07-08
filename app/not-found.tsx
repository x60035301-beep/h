import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist or was moved.</p>
        <Button asChild className="mt-6">
          <Link href="/zh/dashboard">Back to CRM</Link>
        </Button>
      </div>
    </main>
  );
}
