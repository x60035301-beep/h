import { redirect } from "next/navigation";

import { defaultLocale, withLocale } from "@/lib/i18n";

export default function HomePage() {
  redirect(withLocale("/dashboard", defaultLocale));
}
