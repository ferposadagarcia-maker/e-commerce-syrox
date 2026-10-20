"use client";

import type { Sale } from "@/types/sale";
import { formatMXN } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SaleDetailDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function SaleDetailDialog({
  sale,
  open,
  onOpenChange,
}: SaleDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] w-full flex-col gap-0 p-0 sm:max-w-lg">
        {sale ? (
          <>
            <DialogHeader className="border-b p-4 pr-12">
              <DialogTitle>Detalle de venta</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                {sale.id}
              </DialogDescription>
              <p className="text-xs text-muted-foreground">
                {formatDate(sale.createdAt)}
              </p>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-12 gap-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-right">Cant.</div>
                <div className="col-span-4 text-right">Subtotal</div>
              </div>
              <div className="divide-y divide-border">
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 py-3 text-sm"
                  >
                    <div className="col-span-6">
                      <div className="font-medium">
                        {item.product?.name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatMXN(item.unitPrice)} c/u
                      </div>
                    </div>
                    <div className="col-span-2 text-right tabular-nums">
                      {item.quantity}
                    </div>
                    <div className="col-span-4 text-right font-medium tabular-nums">
                      {formatMXN(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border mt-2 pt-4 text-sm">
                <span className="font-medium">Total</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatMXN(sale.total)}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
