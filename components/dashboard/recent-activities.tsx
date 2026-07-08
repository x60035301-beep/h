import Link from "next/link";
import { Activity, BellRing, FileText, Mail, PenLine, PlusCircle, Route, Upload, UserCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/dictionaries";
import { timeAgo } from "@/lib/utils";
import type { Activity as CrmActivity, ActivityType, Locale } from "@/types/crm";

const icons: Record<ActivityType, typeof Activity> = {
  customer_created: PlusCircle,
  customer_updated: PenLine,
  followup_created: Activity,
  quotation_created: FileText,
  stage_changed: PenLine,
  attachment_uploaded: Upload,
  task_created: Activity,
  reminder_sent: BellRing,
  email_sent: Mail,
  sales_assigned: UserCheck,
  manager_escalated: BellRing,
  workflow_run: Route
};

const activityHref: Record<ActivityType, string> = {
  customer_created: "/customers",
  customer_updated: "/customers",
  followup_created: "/customers",
  quotation_created: "/quotations",
  stage_changed: "/kanban",
  attachment_uploaded: "/files",
  task_created: "/followup-tasks",
  reminder_sent: "/sales-reminders",
  email_sent: "/email-center",
  sales_assigned: "/sales-assignment",
  manager_escalated: "/manager-escalation",
  workflow_run: "/workflows"
};

export function RecentActivities({ locale, activities }: { locale: Locale; activities: CrmActivity[] }) {
  const dictionary = getDictionary(locale);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.recentActivities}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = icons[activity.type] ?? Activity;
          const href = `/${locale}${activityHref[activity.type] ?? "/dashboard"}`;
          return (
            <Link
              key={activity.id}
              href={href}
              className="flex gap-3 rounded-md p-1 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{activity.title}</p>
                {activity.description ? <p className="line-clamp-2 text-xs text-muted-foreground">{activity.description}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(activity.created_at, locale)}</p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
