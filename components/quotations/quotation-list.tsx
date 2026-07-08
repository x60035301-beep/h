"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Copy, Download, FileText, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { QuotationForm } from "@/components/quotations/quotation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getCurrencyLabel } from "@/lib/currencies";
import { getDictionary } from "@/lib/dictionaries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerSummary, Locale, Product, Quotation } from "@/types/crm";

export function QuotationList({
  locale,
  quotations,
  customers,
  products
}: {
  locale: Locale;
  quotations: Quotation[];
  customers: CustomerSummary[];
  products: Product[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const dictionary = getDictionary(locale);
  const copy = dictionary.quotations;

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setOpen(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("create");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  async function copyQuotation(id: string) {
    const response = await fetch(`/api/quotations/${id}/copy`, { method: "POST" });
    if (!response.ok) {
      toast({ title: copy.copyFailed, variant: "destructive" });
      return;
    }
    toast({ title: copy.copySuccess });
    location.reload();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{copy.historyTitle}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              {copy.create}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{copy.createTitle}</DialogTitle>
              <DialogDescription>{copy.createDescription}</DialogDescription>
            </DialogHeader>
            <QuotationForm locale={locale} customers={customers} products={products} onSaved={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.quotationNo}</TableHead>
              <TableHead>{copy.customer}</TableHead>
              <TableHead>{copy.status}</TableHead>
              <TableHead>{copy.amount}</TableHead>
              <TableHead>{copy.validUntil}</TableHead>
              <TableHead>{copy.createdAt}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => {
              const customer = customers.find((item) => item.id === quotation.customer_id);
              return (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      {quotation.quotation_no}
                    </span>
                  </TableCell>
                  <TableCell>{customer?.company_name ?? quotation.customer_id}</TableCell>
                  <TableCell>
                    <Badge variant={quotation.status === "accepted" ? "success" : "secondary"}>
                      {dictionary.quotationStatuses[quotation.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{formatCurrency(quotation.total_amount, quotation.currency)}</span>
                      <span className="text-xs text-muted-foreground">{getCurrencyLabel(quotation.currency, locale)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{quotation.valid_until ?? "-"}</TableCell>
                  <TableCell>{formatDate(quotation.created_at, "yyyy-MM-dd HH:mm", locale)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyQuotation(quotation.id)} aria-label={copy.copy}>
                        <Copy />
                      </Button>
                      <Button asChild variant="ghost" size="icon" aria-label={copy.downloadPdf}>
                        <Link href={`/api/quotations/${quotation.id}/pdf`} target="_blank">
                          <Download />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
