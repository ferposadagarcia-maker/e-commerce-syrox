"use client";

import type { Sale } from "@/types/sale";
import { formatMXN } from "@/lib/currency";

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
      <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
        No hay ventas registradas aún. Genera la primera con &quot;Generar Venta&quot;.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="hidden grid-cols-12 gap-4 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
        <div className="col-span-4">Venta</div>
        <div className="col-span-3">Fecha</div>
        <div className="col-span-2">Productos</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1 text-right">Detalle</div>
      </div>
      <div className="divide-y">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="grid grid-cols-1 gap-3 px-6 py-4 text-sm md:grid-cols-12 md:gap-4 md:items-center"
          >
            <div className="md:col-span-4">
              <div className="font-medium font-mono text-xs">
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
              <span className="font-medium tabular-nums">{formatMXN(sale.total)}</span>
            </div>
            <div className="md:col-span-1 md:text-right">
              <button
                className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={() => onViewDetail(sale)}
              >
                Ver detalle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
