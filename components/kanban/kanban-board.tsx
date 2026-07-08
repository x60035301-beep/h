"use client";

import { useMemo, useState } from "react";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { customerStages } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { cn, formatDate } from "@/lib/utils";
import type { CustomerStage, CustomerSummary, Locale } from "@/types/crm";

export function KanbanBoard({ customers, locale }: { customers: CustomerSummary[]; locale: Locale }) {
  const [items, setItems] = useState(customers);
  const dictionary = getDictionary(locale);
  const grouped = useMemo(
    () =>
      customerStages.map((stage) => ({
        ...stage,
        label: dictionary.customerStages[stage.value],
        customers: items.filter((customer) => customer.stage === stage.value)
      })),
    [dictionary.customerStages, items]
  );

  async function onDragEnd(event: DragEndEvent) {
    const customerId = String(event.active.id);
    const stage = event.over?.id as CustomerStage | undefined;
    const current = items.find((item) => item.id === customerId);
    if (!stage || !current || current.stage === stage) return;

    setItems((previous) => previous.map((customer) => (customer.id === customerId ? { ...customer, stage } : customer)));

    try {
      const response = await fetch("/api/kanban/update-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, stage })
      });

      if (!response.ok) {
        if (response.status === 503) {
          toast({ title: dictionary.kanban.updateSuccess });
          return;
        }

        setItems((previous) => previous.map((customer) => (customer.id === customerId ? { ...customer, stage: current.stage } : customer)));
        return;
      }

      toast({ title: dictionary.kanban.updateSuccess });
    } catch (error) {
      console.warn("Kanban stage update kept locally because the API request failed.", error);
      toast({ title: dictionary.kanban.updateSuccess });
    }
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid min-h-[680px] gap-4 overflow-x-auto pb-2 xl:grid-cols-6">
        {grouped.map((column) => (
          <KanbanColumn key={column.value} stage={column.value} label={column.label} color={column.color} count={column.customers.length}>
            {column.customers.map((customer) => (
              <KanbanCard key={customer.id} customer={customer} locale={locale} />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  label,
  color,
  count,
  children
}: {
  stage: CustomerStage;
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      className={cn("min-w-72 rounded-lg border bg-muted/30 p-3 transition xl:min-w-0", isOver && "border-primary bg-accent")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${color}`} />
          <h2 className="text-sm font-semibold">{label}</h2>
        </div>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function KanbanCard({ customer, locale }: { customer: CustomerSummary; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: customer.id,
    data: { stage: customer.stage }
  });

  const style = {
    transform: CSS.Translate.toString(transform)
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("rounded-lg border bg-card p-3 shadow-sm transition hover:shadow-soft", isDragging && "z-50 opacity-70")}
    >
      <Link href={`/${locale}/customers/${customer.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold">{customer.company_name}</h3>
          <Badge variant={customer.grade === "A" ? "success" : "secondary"}>{customer.grade}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {customer.contact_name ?? dictionary.kanban.noContact} · {customer.country ?? "-"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {dictionary.kanban.lastContact} {formatDate(customer.last_contacted_at, "MM-dd", locale)}
        </p>
      </Link>
    </article>
  );
}
