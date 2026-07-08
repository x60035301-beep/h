import { CustomerTable } from "@/components/customers/customer-table";
import { PageHeader } from "@/components/layout/page-header";
import { getCustomers } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function CustomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const customers = await getCustomers();

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.customers.title} description={dictionary.pages.customers.description} />
      <CustomerTable customers={customers} locale={locale} />
    </div>
  );
}
