import Link from "next/link";
import { BellRing, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/utils";
import type { Locale, Reminder } from "@/types/crm";

export function ReminderList({ locale, reminders }: { locale: Locale; reminders: Reminder[] }) {
  const dictionary = getDictionary(locale);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.todayReminders}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => {
          const href = reminder.customer_id ? `/${locale}/customers/${reminder.customer_id}` : `/${locale}/reminders`;
          return (
            <Link
              key={reminder.id}
              href={href}
              className="block rounded-md border p-3 transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <BellRing className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="line-clamp-2 text-sm font-medium">{reminder.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDate(reminder.due_at, "yyyy-MM-dd HH:mm", locale)}
                    </p>
                  </div>
                </div>
                <Badge variant={reminder.type === "quotation" ? "warning" : "secondary"}>{dictionary.reminderTypes[reminder.type]}</Badge>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
