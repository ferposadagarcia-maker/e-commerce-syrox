"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import type { CreateSalePayload } from "@/types/sale";
import { formatMXN } from "@/lib/currency";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface LineItem {
  productId: string;
  quantity: number;
}

interface SaleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (payload: CreateSalePayload) => void;
  isSubmitting: boolean;
}

export function SaleFormSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
  isSubmitting,
}: SaleFormSheetProps) {
  const [lines, setLines] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const availableProducts = useMemo(
    () => products.filter((product) => !lines.some((line) => line.productId === product.id)),
    [products, lines]
  );

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = productsById.get(line.productId);
        if (!product) return sum;
        return sum + Number(product.price) * line.quantity;
      }, 0),
    [lines, productsById]
  );

  function reset() {
    setLines([]);
    setSelectedProductId("");
    setError(null);
  }

  function handleAdd() {
    setError(null);
    const productId = selectedProductId || availableProducts[0]?.id || "";
    if (!productId) {
      setError("Selecciona un producto.");
      return;
    }
    if (lines.some((line) => line.productId === productId)) {
      setError("Ese producto ya está en la venta.");
      return;
    }
    setLines((prev) => [...prev, { productId, quantity: 1 }]);
    setSelectedProductId("");
  }

  function updateQuantity(productId: string, quantity: number) {
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, quantity } : line
      )
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }

  function handleSubmit() {
    setError(null);
    if (lines.length === 0) {
      setError("Agrega al menos un producto.");
      return;
    }
    const invalid = lines.find(
      (line) => !Number.isInteger(line.quantity) || line.quantity < 1
    );
    if (invalid) {
      setError("Las cantidades deben ser enteros positivos.");
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-space-grotesk)]">
            Generar venta
          </SheetTitle>
          <SheetDescription>
            Selecciona productos y cantidades. El total se calcula en el servidor.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          {products.length === 0 ? (
            <p className="border rounded-md px-3 py-3 text-sm text-muted-foreground">
              No hay productos disponibles. Primero crea productos en{" "}
              <Link href="/products" className="underline underline-offset-2">
                Productos
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-2 border rounded-md p-3">
              <label className="text-sm font-medium" htmlFor="sale-product">
                Producto
              </label>
              <div className="flex gap-2">
                <select
                  id="sale-product"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                  className="h-10 shrink-0 rounded-md border px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                  onClick={handleAdd}
                  disabled={isSubmitting || availableProducts.length === 0}
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {lines.length > 0 ? (
            <div className="border rounded-md divide-y">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Producto</div>
                <div className="col-span-3 text-right">Cantidad</div>
                <div className="col-span-3 text-right">Acción</div>
              </div>
              {lines.map((line) => {
                const product = productsById.get(line.productId);
                return (
                  <div key={line.productId} className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center">
                    <div className="col-span-6">
                      <div className="font-medium">{product?.name ?? "—"}</div>
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
                          updateQuantity(line.productId, Number(event.target.value))
                        }
                        className="h-9 w-full rounded-md border px-2 text-right text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="col-span-3 text-right">
                      <button
                        type="button"
                        className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
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
                <span className="font-semibold tabular-nums">{formatMXN(estimatedTotal)}</span>
              </div>
            </div>
          ) : (
            products.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no has agregado productos a la venta.
              </p>
            ) : null
          )}
        </div>

        <div className="mt-auto flex items-center justify-end gap-2 border-t p-4">
          <button
            type="button"
            className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting || products.length === 0}
          >
            {isSubmitting ? "Registrando..." : "Registrar venta"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
