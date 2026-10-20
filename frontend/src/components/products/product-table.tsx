"use client";

import type { Product } from "@/types/product";
import { formatMXN } from "@/lib/currency";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onArchive: (product: Product) => void;
  onRestore: (product: Product) => void;
  isDeleting: boolean;
  busyId: string | null;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  isDeleting,
  busyId,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
        No hay productos aún. Crea el primero haciendo clic en &quot;Nuevo
        producto&quot;.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="hidden grid-cols-12 gap-4 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
        <div className="col-span-1">Imagen</div>
        <div className="col-span-3">Nombre</div>
        <div className="col-span-2">Categoría</div>
        <div className="col-span-2">Descripción</div>
        <div className="col-span-4 text-right">Precio / Acciones</div>
      </div>
      <div className="divide-y">
        {products.map((product) => {
          const isBusy = busyId === product.id;
          return (
            <div
              key={product.id}
              className={
                "grid grid-cols-1 gap-3 px-6 py-4 text-sm md:grid-cols-12 md:gap-4 md:items-center " +
                (product.isActive ? "" : "opacity-70")
              }
            >
              <div className="md:col-span-1">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center gap-2 font-medium">
                  {product.name}
                  {!product.isActive ? (
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                      Archivado
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground md:hidden">
                  {product.category?.name ?? "—"}
                </div>
              </div>
              <div className="hidden text-muted-foreground md:col-span-2 md:block">
                {product.category?.name ?? "—"}
              </div>
              <div className="text-muted-foreground md:col-span-2 truncate">
                {product.description ?? "—"}
              </div>
              <div className="flex items-center justify-between gap-2 md:col-span-4 md:justify-end">
                <span className="font-medium tabular-nums">
                  {formatMXN(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    onClick={() => onEdit(product)}
                    disabled={isDeleting || isBusy}
                  >
                    Editar
                  </button>
                  {product.isActive ? (
                    <button
                      className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                      onClick={() => onArchive(product)}
                      disabled={isDeleting || isBusy}
                    >
                      Archivar
                    </button>
                  ) : (
                    <button
                      className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                      onClick={() => onRestore(product)}
                      disabled={isDeleting || isBusy}
                    >
                      Restaurar
                    </button>
                  )}
                  <button
                    className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    onClick={() => onDelete(product)}
                    disabled={isDeleting || isBusy}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
