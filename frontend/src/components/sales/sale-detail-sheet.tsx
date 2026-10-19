"use client";

import type { Sale } from "@/types/sale";
import { formatMXN } from "@/lib/currency";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SaleDetailSheetProps {
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

export function SaleDetailSheet({ sale, open, onOpenChange }: SaleDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {sale ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-[family-name:var(--font-space-grotesk)]">
                Detalle de venta
              </SheetTitle>
              <SheetDescription className="font-mono text-xs">
                {sale.id}
              </SheetDescription>
              <p className="text-xs text-muted-foreground">
                {formatDate(sale.createdAt)}
              </p>
            </SheetHeader>

            <div className="px-4">
              <div className="grid grid-cols-12 gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-right">Cant.</div>
                <div className="col-span-4 text-right">Subtotal</div>
              </div>
              <div className="divide-y">
                {sale.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 py-3 text-sm">
                    <div className="col-span-6">
                      <div className="font-medium">{item.product?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatMXN(item.unitPrice)} c/u
                      </div>
                    </div>
                    <div className="col-span-2 text-right tabular-nums">{item.quantity}</div>
                    <div className="col-span-4 text-right font-medium tabular-nums">
                      {formatMXN(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t mt-2 pt-4 text-sm">
                <span className="font-medium">Total</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatMXN(sale.total)}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
