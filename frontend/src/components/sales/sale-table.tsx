"use client";

import type { Sale } from "@/types/sale";
import { formatMXN } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface SaleTableProps {
  sales: Sale[];
  onViewDetail: (sale: Sale) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function totalUnits(sale: Sale): number {
  return sale.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function SaleTable({ sales, onViewDetail }: SaleTableProps) {
  if (sales.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Todavía no hay ventas registradas. Crea la primera con &quot;Nueva
        venta&quot;.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="hidden grid-cols-12 gap-4 bg-muted px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground md:grid">
        <div className="col-span-4">Venta</div>
        <div className="col-span-3">Fecha</div>
        <div className="col-span-2">Productos</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1 text-right">Detalle</div>
      </div>
      <div className="divide-y divide-border">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="grid grid-cols-1 gap-3 bg-table-row px-4 py-4 text-sm transition-colors hover:bg-accent/40 sm:px-6 md:grid-cols-12 md:gap-4 md:items-center"
          >
            <div className="md:col-span-4">
              <div className="font-mono text-xs text-foreground">
                {sale.id.slice(0, 8)}
              </div>
              <div className="text-xs text-muted-foreground md:hidden">
                {formatDate(sale.createdAt)}
              </div>
            </div>
            <div className="hidden text-muted-foreground md:col-span-3 md:block">
              {formatDate(sale.createdAt)}
            </div>
            <div className="text-muted-foreground md:col-span-2">
              {totalUnits(sale)} {totalUnits(sale) === 1 ? "unidad" : "unidades"}
            </div>
            <div className="flex items-center justify-between gap-2 md:col-span-2 md:justify-end">
              <span className="font-heading text-base font-semibold tabular-nums">
                {formatMXN(sale.total)}
              </span>
            </div>
            <div className="md:col-span-1 md:text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetail(sale)}
              >
                Ver detalle
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
