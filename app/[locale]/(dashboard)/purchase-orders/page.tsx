import { PageHeader } from "@/components/layout/page-header";
import { PurchaseOrderList } from "@/components/purchase-orders/purchase-order-list";
import { getCustomers, getPurchaseOrders } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function PurchaseOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const [orders, customers] = await Promise.all([getPurchaseOrders(), getCustomers()]);

  return <div className="page-shell">
    <PageHeader title={dictionary.pages.purchaseOrders.title} description={dictionary.pages.purchaseOrders.description} />
    <PurchaseOrderList locale={locale} orders={orders} customers={customers} />
  </div>;
}
