import type { MetadataRoute } from "next";

import { appName } from "@/config/crm";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appName} V2.0`,
    short_name: "HOMY CRM",
    description: "AI First CRM, ERP, and BI workspace for HOMY sponge factory.",
    start_url: "/zh/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    categories: ["business", "productivity"]
  };
}
