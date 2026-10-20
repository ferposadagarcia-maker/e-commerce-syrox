"use client";

import Link from "next/link";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { formatMXN } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";

interface CategoryAccordionProps {
  categories: Category[];
  productsByCategory: Map<string, Product[]>;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onArchive: (category: Category) => void;
  onRestore: (category: Category) => void;
  busyId: string | null;
}

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
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        No hay categorías aún. Crea la primera haciendo clic en &quot;Nueva
        categoría&quot;.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card px-5 sm:px-6">
      <Accordion>
        {categories.map((category) => {
          const products = productsByCategory.get(category.id) ?? [];
          const count = products.length;
          const isBusy = busyId === category.id;
          return (
            <AccordionItem key={category.id} value={category.id} className="py-1">
              <AccordionHeader className="items-center gap-3">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="font-heading text-lg font-medium">
                        {category.name}
                      </span>
                      {!category.isActive ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
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
                  className="flex shrink-0 items-center gap-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${category.name}`}
                    onClick={() => onEdit(category)}
                    disabled={isBusy}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {category.isActive ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Archivar ${category.name}`}
                        onClick={() => onArchive(category)}
                        disabled={isBusy}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${category.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(category)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Restaurar ${category.name}`}
                      onClick={() => onRestore(category)}
                      disabled={isBusy}
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </AccordionHeader>

              <AccordionPanel>
                <div className="pb-5">
                  {products.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                      Esta categoría no tiene productos.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
                      {products.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products?edit=${product.id}`}
                            className="flex items-center gap-3 bg-table-row px-3 py-2.5 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
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
                            <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="truncate font-medium">
                                  {product.name}
                                </span>
                                {!product.isActive ? (
                                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                                    Archivado
                                  </span>
                                ) : null}
                              </span>
                              <span className="shrink-0 tabular-nums text-muted-foreground">
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
