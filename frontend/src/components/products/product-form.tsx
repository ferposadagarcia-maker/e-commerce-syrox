"use client";

import type { Category } from "@/types/category";
import type { CreateProductPayload, UpdateProductPayload } from "@/types/product";

interface ProductFormProps {
  categories: Category[];
  initialName?: string;
  initialDescription?: string | null;
  initialPrice?: string;
  initialCategoryId?: string;
  onSubmit: (data: CreateProductPayload | UpdateProductPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function ProductForm({
  categories,
  initialName = "",
  initialDescription = "",
  initialPrice = "",
  initialCategoryId = "",
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: ProductFormProps) {
  const hasCategories = categories.length > 0;

  return (
    <form
      className="space-y-4 border rounded-lg p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const descriptionRaw = formData.get("description");
        const description =
          descriptionRaw === null || String(descriptionRaw).trim() === ""
            ? undefined
            : String(descriptionRaw).trim();
        const priceValue = String(formData.get("price") ?? "").trim();
        const categoryId = String(formData.get("categoryId") ?? "");

        const payload: CreateProductPayload = {
          name,
          price: Number(priceValue),
          categoryId,
        };
        if (description !== undefined) {
          payload.description = description;
        }
        onSubmit(payload);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="product-name">
            Nombre
          </label>
          <input
            id="product-name"
            name="name"
            defaultValue={initialName}
            className="h-10 w-full rounded-md border px-3 text-sm"
            placeholder="Nombre del producto"
            maxLength={150}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="product-price">
            Precio
          </label>
          <input
            id="product-price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={initialPrice}
            className="h-10 w-full rounded-md border px-3 text-sm"
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Mayor que 0 y máximo 2 decimales.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="product-category">
            Categoría
          </label>
          <select
            id="product-category"
            name="categoryId"
            defaultValue={initialCategoryId}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            required
            disabled={isSubmitting || !hasCategories}
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="product-description">
            Descripción
          </label>
          <textarea
            id="product-description"
            name="description"
            defaultValue={initialDescription ?? ""}
            className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Descripción opcional"
            maxLength={1000}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-dashed p-3">
        <p className="text-sm font-medium">Imagen del producto</p>
        <p className="text-xs text-muted-foreground">
          Funcionalidad pendiente. La subida y el almacenamiento de imágenes se
          implementarán en una fase posterior.
        </p>
      </div>

      {!hasCategories ? (
        <p className="text-sm text-destructive">
          No hay categorías disponibles. Crea una categoría antes de registrar
          productos.
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          disabled={isSubmitting || !hasCategories}
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
