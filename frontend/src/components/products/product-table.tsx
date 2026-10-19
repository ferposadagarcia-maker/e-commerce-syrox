"use client";

import type { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isDeleting: boolean;
}

function formatPrice(price: string): string {
  const value = Number(price);
  if (Number.isNaN(value)) {
    return price;
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function ProductTable({ products, onEdit, onDelete, isDeleting }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
        No hay productos aún. Crea el primero haciendo clic en &quot;Nuevo producto&quot;.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="hidden grid-cols-12 gap-4 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
        <div className="col-span-4">Nombre</div>
        <div className="col-span-3">Categoría</div>
        <div className="col-span-3">Descripción</div>
        <div className="col-span-2 text-right">Precio / Acciones</div>
      </div>
      <div className="divide-y">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-1 gap-3 px-6 py-4 text-sm md:grid-cols-12 md:gap-4 md:items-center"
          >
            <div className="md:col-span-4">
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-muted-foreground md:hidden">
                {product.category?.name ?? "—"}
              </div>
            </div>
            <div className="hidden text-muted-foreground md:col-span-3 md:block">
              {product.category?.name ?? "—"}
            </div>
            <div className="text-muted-foreground md:col-span-3 truncate">
              {product.description ?? "—"}
            </div>
            <div className="flex items-center justify-between gap-2 md:col-span-2 md:justify-end">
              <span className="font-medium tabular-nums">{formatPrice(product.price)}</span>
              <div className="flex items-center gap-2">
                <button
                  className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={() => onEdit(product)}
                  disabled={isDeleting}
                >
                  Editar
                </button>
                <button
                  className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={() => onDelete(product)}
                  disabled={isDeleting}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
