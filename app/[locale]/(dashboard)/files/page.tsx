import { FileCenter } from "@/components/files/file-center";
import { PageHeader } from "@/components/layout/page-header";
import { getAttachments, getCustomers } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function FilesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const [attachments, customers] = await Promise.all([getAttachments(), getCustomers()]);

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.files.title} description={dictionary.pages.files.description} />
      <FileCenter attachments={attachments} customers={customers} />
    </div>
  );
}
