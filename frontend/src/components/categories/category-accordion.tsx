"use client";

import { forwardRef } from "react";
import Link from "next/link";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { formatMXN } from "@/lib/currency";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CategoryAccordionProps {
  categories: Category[];
  productsByCategory: Map<string, Product[]>;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onArchive: (category: Category) => void;
  onRestore: (category: Category) => void;
  busyId: string | null;
}

const ActionButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function ActionButton({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={
        "h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 " +
        (className ?? "")
      }
      {...props}
    >
      {children}
    </button>
  );
});

export function CategoryAccordion({
  categories,
  productsByCategory,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  busyId,
}: CategoryAccordionProps) {
  if (categories.length === 0) {
    return (
      <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
        No hay categorías aún. Crea la primera haciendo clic en &quot;Nueva
        categoría&quot;.
      </div>
    );
  }

  return (
    <div className="border rounded-lg px-6">
      <Accordion>
        {categories.map((category) => {
          const products = productsByCategory.get(category.id) ?? [];
          const count = products.length;
          const isBusy = busyId === category.id;
          return (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionHeader className="items-center gap-3">
                <AccordionTrigger>
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      {category.name}
                      {!category.isActive ? (
                        <span className="rounded-full border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                          Archivada
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {count} {count === 1 ? "producto" : "productos"}
                      {category.description ? ` · ${category.description}` : ""}
                    </span>
                  </span>
                </AccordionTrigger>

                <div
                  className="flex shrink-0 items-center gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ActionButton
                    type="button"
                    onClick={() => onEdit(category)}
                    disabled={isBusy}
                  >
                    Editar
                  </ActionButton>
                  {category.isActive ? (
                    <ActionButton
                      type="button"
                      onClick={() => onArchive(category)}
                      disabled={isBusy}
                    >
                      Archivar
                    </ActionButton>
                  ) : (
                    <ActionButton
                      type="button"
                      onClick={() => onRestore(category)}
                      disabled={isBusy}
                    >
                      Restaurar
                    </ActionButton>
                  )}
                  {category.isActive ? (
                    <ActionButton
                      type="button"
                      onClick={() => onDelete(category)}
                      disabled={isBusy}
                    >
                      Eliminar
                    </ActionButton>
                  ) : null}
                </div>
              </AccordionHeader>

              <AccordionPanel>
                <div className="pb-4">
                  {products.length === 0 ? (
                    <p className="rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">
                      Esta categoría no tiene productos.
                    </p>
                  ) : (
                    <ul className="divide-y rounded-md border">
                      {products.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products?edit=${product.id}`}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-accent/60"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
                              {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-muted-foreground">
                                  —
                                </span>
                              )}
                            </span>
                            <span className="flex flex-1 items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <span className="font-medium">
                                  {product.name}
                                </span>
                                {!product.isActive ? (
                                  <span className="rounded-full border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                                    Archivado
                                  </span>
                                ) : null}
                              </span>
                              <span className="tabular-nums text-muted-foreground">
                                {formatMXN(product.price)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
