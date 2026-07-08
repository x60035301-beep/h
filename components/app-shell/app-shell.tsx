import type { ReactNode } from "react";

import { Navbar } from "@/components/app-shell/navbar";
import { NavigationProgressProvider } from "@/components/app-shell/navigation-progress";
import { PageTransition } from "@/components/app-shell/page-transition";
import { Sidebar } from "@/components/app-shell/sidebar";
import type { SessionProfile } from "@/lib/permissions";
import type { Locale } from "@/types/crm";

export function AppShell({
  children,
  locale,
  profile
}: {
  children: ReactNode;
  locale: Locale;
  profile: SessionProfile;
}) {
  return (
    <NavigationProgressProvider>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar locale={locale} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar locale={locale} profile={profile} />
            <main className="min-w-0 flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>
      </div>
    </NavigationProgressProvider>
  );
}
