"use client";

import type { Category } from "@/types/category";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isDeleting: boolean;
}

export function CategoryTable({ categories, onEdit, onDelete, isDeleting }: CategoryTableProps) {
  if (categories.length === 0) {
    return (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No hay categorías aún. Crea la primera haciendo clic en &quot;Nueva categoría&quot;.
        </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-12 gap-4 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground">
        <div className="col-span-4">Nombre</div>
        <div className="col-span-6">Descripción</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>
      <div className="divide-y">
        {categories.map((category) => (
          <div key={category.id} className="grid grid-cols-12 gap-4 px-6 py-4 text-sm">
            <div className="col-span-4 font-medium">{category.name}</div>
            <div className="col-span-6 text-muted-foreground truncate">
              {category.description ?? "—"}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <button
                className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={() => onEdit(category)}
                disabled={isDeleting}
              >
                Editar
              </button>
              <button
                className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={() => onDelete(category)}
                disabled={isDeleting}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
