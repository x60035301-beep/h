import Link from "next/link";

import { customerStages } from "@/config/crm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale, StageCount } from "@/types/crm";

export function SalesFunnel({ locale, stages }: { locale: Locale; stages: StageCount[] }) {
  const dictionary = getDictionary(locale);
  const max = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>{dictionary.dashboard.salesFunnel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customerStages.map((stage) => {
          const row = stages.find((item) => item.stage === stage.value);
          const count = row?.count ?? 0;
          const width = `${Math.max(10, (count / max) * 100)}%`;
          return (
            <Link
              key={stage.value}
              href={`/${locale}/kanban`}
              className="grid gap-2 rounded-md p-1 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${stage.color}`} />
                  <span className="font-medium">{dictionary.customerStages[stage.value]}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className={`h-2 rounded-full ${stage.color}`} style={{ width }} />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
