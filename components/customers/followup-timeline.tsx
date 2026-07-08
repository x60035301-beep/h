import { Mail, MessageCircle, Phone, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { CommunicationMethod, Followup } from "@/types/crm";

const icons: Record<CommunicationMethod, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
  meeting: Users
};

export function FollowupTimeline({ followups }: { followups: Followup[] }) {
  if (!followups.length) {
    return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">暂无跟进记录</p>;
  }

  return (
    <div className="space-y-4">
      {followups.map((followup) => {
        const Icon = icons[followup.method];
        return (
          <div key={followup.id} className="relative flex gap-3 rounded-lg border p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{followup.method}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(followup.followed_at)}</span>
              </div>
              <p className="mt-2 text-sm leading-6">{followup.content}</p>
              {followup.next_step ? <p className="mt-2 text-sm text-muted-foreground">下一步：{followup.next_step}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
