import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { NextDevtoolsLocalizer } from "@/components/dev/next-devtools-localizer";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { appName, appVersion } from "@/config/crm";

const inter = Inter({ subsets: ["latin"] });
const shouldLocalizeNextDevtools = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  title: `${appName} ${appVersion}`,
  description: "Modern AI First CRM for HOMY sponge factory sales, quotations, orders, production, and BI.",
  manifest: "/manifest.webmanifest",
  applicationName: appName,
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "default"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            {shouldLocalizeNextDevtools ? <NextDevtoolsLocalizer /> : null}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
