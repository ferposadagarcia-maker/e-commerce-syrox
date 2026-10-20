"use client";

import type { Product } from "@/types/product";
import { formatMXN } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  ArchiveRestore,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onArchive: (product: Product) => void;
  onRestore: (product: Product) => void;
  isDeleting: boolean;
  busyId: string | null;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) return null;
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
      Archivado
    </span>
  );
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
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        No hay productos aún. Crea el primero haciendo clic en &quot;Nuevo
        producto&quot;.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="hidden grid-cols-12 gap-4 bg-muted px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground md:grid">
        <div className="col-span-5">Producto</div>
        <div className="col-span-3">Categoría</div>
        <div className="col-span-2">Descripción</div>
        <div className="col-span-1 text-right">Precio</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>
      <div className="divide-y divide-border">
        {products.map((product) => {
          const isBusy = busyId === product.id;
          return (
            <div
              key={product.id}
              className={
                "grid grid-cols-1 gap-3 bg-table-row px-4 py-4 text-sm transition-colors hover:bg-accent/40 sm:px-6 md:grid-cols-12 md:gap-4 md:items-center " +
                (product.isActive ? "" : "opacity-70")
              }
            >
              <div className="flex items-center gap-3 md:col-span-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30 md:h-16 md:w-16">
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="truncate">{product.name}</span>
                    <StatusBadge isActive={product.isActive} />
                  </div>
                  <div className="text-xs text-muted-foreground md:hidden">
                    {product.category?.name ?? "—"} ·{" "}
                    <span className="tabular-nums">
                      {formatMXN(product.price)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden text-muted-foreground md:col-span-3 md:block">
                {product.category?.name ?? "—"}
              </div>
              <div className="hidden truncate text-muted-foreground md:col-span-2 md:block">
                {product.description ?? "—"}
              </div>
              <div className="hidden font-medium tabular-nums md:col-span-1 md:block md:text-right">
                {formatMXN(product.price)}
              </div>
              <div className="flex items-center justify-end md:col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones de ${product.name}`}
                        disabled={isDeleting || isBusy}
                      />
                    }
                  >
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    {product.isActive ? (
                      <DropdownMenuItem onClick={() => onArchive(product)}>
                        <Archive />
                        Archivar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onRestore(product)}>
                        <ArchiveRestore />
                        Restaurar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(product)}
                    >
                      <Trash2 />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
