"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import type { CreateSalePayload } from "@/types/sale";
import { formatMXN } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LineItem {
  productId: string;
  quantity: number;
}

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (payload: CreateSalePayload) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function SaleFormDialog({
  open,
  onOpenChange,
  products,
  onSubmit,
  isSubmitting,
  error = null,
}: SaleFormDialogProps) {
  const [lines, setLines] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const availableProducts = useMemo(
    () =>
      products.filter(
        (product) => !lines.some((line) => line.productId === product.id),
      ),
    [products, lines],
  );

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = productsById.get(line.productId);
        if (!product) return sum;
        return sum + Number(product.price) * line.quantity;
      }, 0),
    [lines, productsById],
  );

  function reset() {
    setLines([]);
    setSelectedProductId("");
    setLocalError(null);
  }

  function handleAdd() {
    setLocalError(null);
    const productId = selectedProductId || availableProducts[0]?.id || "";
    if (!productId) {
      setLocalError("Selecciona un producto.");
      return;
    }
    if (lines.some((line) => line.productId === productId)) {
      setLocalError("Ese producto ya está en la venta.");
      return;
    }
    setLines((prev) => [...prev, { productId, quantity: 1 }]);
    setSelectedProductId("");
  }

  function updateQuantity(productId: string, quantity: number) {
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, quantity } : line,
      ),
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }

  function handleSubmit() {
    setLocalError(null);
    if (lines.length === 0) {
      setLocalError("Agrega al menos un producto.");
      return;
    }
    const invalid = lines.find(
      (line) => !Number.isInteger(line.quantity) || line.quantity < 1,
    );
    if (invalid) {
      setLocalError("Las cantidades deben ser enteros positivos.");
      return;
    }
    onSubmit({
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next, eventDetails) => {
        if (isSubmitting && !next) {
          eventDetails.cancel();
          return;
        }
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[calc(100vh-2rem)] w-full flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-4 pr-12">
          <DialogTitle>Generar venta</DialogTitle>
          <DialogDescription>
            Selecciona productos y cantidades. El total se calcula en el
            servidor.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {products.length === 0 ? (
            <p className="border rounded-md px-3 py-3 text-sm text-muted-foreground">
              No hay productos disponibles. Primero crea productos en{" "}
              <Link href="/products" className="underline underline-offset-2">
                Productos
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-2 border rounded-md border-border p-3">
              <label className="text-sm font-medium" htmlFor="sale-product">
                Producto
              </label>
              <div className="flex gap-2">
                <select
                  id="sale-product"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  disabled={isSubmitting || availableProducts.length === 0}
                >
                  <option value="">Selecciona un producto</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatMXN(product.price)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="h-10 shrink-0 rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
                  onClick={handleAdd}
                  disabled={isSubmitting || availableProducts.length === 0}
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          {error || localError ? (
            <p className="text-sm text-destructive" role="alert">
              {error ?? localError}
            </p>
          ) : null}

          {lines.length > 0 ? (
            <div className="border rounded-md border-border divide-y divide-border">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Producto</div>
                <div className="col-span-3 text-right">Cantidad</div>
                <div className="col-span-3 text-right">Acción</div>
              </div>
              {lines.map((line) => {
                const product = productsById.get(line.productId);
                return (
                  <div
                    key={line.productId}
                    className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center"
                  >
                    <div className="col-span-6">
                      <div className="font-medium">
                        {product?.name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product ? formatMXN(product.price) : "—"} c/u
                      </div>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(event) =>
                          updateQuantity(
                            line.productId,
                            Number(event.target.value),
                          )
                        }
                        className="h-9 w-full rounded-md border border-input bg-card px-2 text-right text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="col-span-3 text-right">
                      <button
                        type="button"
                        className="h-8 rounded-md border border-input px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        onClick={() => removeLine(line.productId)}
                        disabled={isSubmitting}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-3 py-3 text-sm">
                <span className="font-medium">Total estimado</span>
                <span className="font-semibold tabular-nums">
                  {formatMXN(estimatedTotal)}
                </span>
              </div>
            </div>
          ) : products.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has agregado productos a la venta.
            </p>
          ) : null}
        </div>

        <DialogFooter className="border-t bg-transparent p-4 sm:justify-end">
          <button
            type="button"
            className="h-9 rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting || products.length === 0}
          >
            {isSubmitting ? "Registrando..." : "Registrar venta"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
