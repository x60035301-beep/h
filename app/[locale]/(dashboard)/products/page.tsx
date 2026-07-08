import { PageHeader } from "@/components/layout/page-header";
import { ProductManager } from "@/components/products/product-manager";
import { getProducts } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const products = await getProducts();

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.products.title} description={dictionary.pages.products.description} />
      <ProductManager products={products} />
    </div>
  );
}
