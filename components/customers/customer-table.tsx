"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";

import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerImportDialog } from "@/components/customers/customer-import-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDictionary, formatDictionaryString } from "@/lib/dictionaries";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { CustomerSummary, Locale } from "@/types/crm";

export function CustomerTable({ customers, locale }: { customers: CustomerSummary[]; locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dictionary = getDictionary(locale);
  const copy = dictionary.customerTable;

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setOpen(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("create");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const columns = useMemo<ColumnDef<CustomerSummary>[]>(
    () => [
      {
        accessorKey: "company_name",
        header: ({ column }) => (
          <Button variant="ghost" className="px-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {copy.headers.companyName}
            <ArrowUpDown className="size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link className="font-medium hover:text-primary" href={`/${locale}/customers/${row.original.id}`}>
            {row.original.company_name}
          </Link>
        )
      },
      { accessorKey: "contact_name", header: copy.headers.contactName },
      { accessorKey: "country", header: copy.headers.country },
      { accessorKey: "industry", header: copy.headers.industry },
      { accessorKey: "company_type", header: copy.headers.companyType },
      { accessorKey: "whatsapp", header: copy.headers.whatsapp },
      { accessorKey: "email", header: copy.headers.email },
      { accessorKey: "source", header: copy.headers.source },
      {
        accessorKey: "grade",
        header: copy.headers.grade,
        cell: ({ row }) => <Badge variant={row.original.grade === "A" ? "success" : "secondary"}>{row.original.grade}</Badge>
      },
      {
        accessorKey: "stage",
        header: copy.headers.stage,
        cell: ({ row }) => <Badge variant="outline">{dictionary.customerStages[row.original.stage]}</Badge>
      },
      {
        accessorKey: "last_contacted_at",
        header: copy.headers.lastContactedAt,
        cell: ({ row }) => formatDate(row.original.last_contacted_at, "yyyy-MM-dd", locale)
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={copy.actions}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/customers/${row.original.id}`}>{copy.viewDetail}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={deletingId === row.original.id}
                onSelect={(event) => {
                  event.preventDefault();
                  void deleteCustomer(row.original.id);
                }}
                className="text-destructive"
              >
                {deletingId === row.original.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {copy.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [copy, deletingId, dictionary.customerStages, locale]
  );

  const table = useReactTable({
    data: customers,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  async function deleteCustomer(id: string) {
    if (!window.confirm(getDeleteConfirmText(locale))) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        toast({ title: copy.deleteFailed, description: result?.error ?? result?.message, variant: "destructive" });
        return;
      }
      toast({ title: copy.deleteSuccess });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CustomerImportDialog />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                {copy.create}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{copy.createTitle}</DialogTitle>
                <DialogDescription>{copy.createDescription}</DialogDescription>
              </DialogHeader>
              <CustomerForm onSaved={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {copy.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {formatDictionaryString(copy.pageOf, {
            page: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount() || 1
          })}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {copy.previous}
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {copy.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getDeleteConfirmText(locale: Locale) {
  if (locale === "en") return "Delete this customer and its related contacts, follow-ups, quotations, reminders, and activities?";
  if (locale === "id") return "Hapus pelanggan ini beserta kontak, follow-up, quotation, reminder, dan aktivitas terkait?";
  return "确认删除该客户及其联系人、跟进、报价、提醒和活动记录？";
}
