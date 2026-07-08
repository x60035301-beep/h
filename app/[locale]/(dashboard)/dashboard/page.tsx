import { BellRing, DollarSign, FileText, Handshake, UserPlus, Users } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { ReminderList } from "@/components/dashboard/reminder-list";
import { SalesFunnel } from "@/components/dashboard/sales-funnel";
import { PageHeader } from "@/components/layout/page-header";
import { getDashboardData } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const { stats, stageCounts, activities, reminders } = await getDashboardData();
  const metrics = dictionary.dashboard.metrics;

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.dashboard.title} description={dictionary.pages.dashboard.description} />

      <section className="section-grid">
        <MetricCard
          title={metrics.totalCustomers.title}
          value={stats.totalCustomers}
          hint={metrics.totalCustomers.description}
          icon={Users}
          href={`/${locale}/customers`}
        />
        <MetricCard
          title={metrics.newCustomersToday.title}
          value={stats.newCustomersToday}
          hint={metrics.newCustomersToday.description}
          icon={UserPlus}
          href={`/${locale}/customers`}
        />
        <MetricCard
          title={metrics.pendingFollowups.title}
          value={stats.pendingFollowups}
          hint={metrics.pendingFollowups.description}
          icon={BellRing}
          href={`/${locale}/reminders`}
          tone="warning"
        />
        <MetricCard
          title={metrics.quotationsToday.title}
          value={stats.quotationsToday}
          hint={metrics.quotationsToday.description}
          icon={FileText}
          href={`/${locale}/quotations`}
        />
        <MetricCard
          title={metrics.wonCustomers.title}
          value={stats.wonCustomers}
          hint={metrics.wonCustomers.description}
          icon={Handshake}
          href={`/${locale}/kanban`}
          tone="success"
        />
        <MetricCard
          title={metrics.revenueAmount.title}
          value={formatCurrency(stats.revenueAmount)}
          hint={metrics.revenueAmount.description}
          icon={DollarSign}
          href={`/${locale}/quotations`}
          tone="success"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SalesFunnel locale={locale} stages={stageCounts} />
        <ReminderList locale={locale} reminders={reminders} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <RecentActivities locale={locale} activities={activities} />
      </section>
    </div>
  );
}
