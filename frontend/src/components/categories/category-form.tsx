"use client";

import type { CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category";

interface CategoryFormProps {
  initialName?: string;
  initialDescription?: string | null;
  onSubmit: (data: CreateCategoryPayload | UpdateCategoryPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function CategoryForm({
  initialName = "",
  initialDescription = "",
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: CategoryFormProps) {
  return (
    <form
      className="space-y-3 border rounded-lg p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const descriptionRaw = formData.get("description");
        const description =
          descriptionRaw === null || String(descriptionRaw).trim() === ""
            ? undefined
            : String(descriptionRaw).trim();
        onSubmit({ name, description } as CreateCategoryPayload | UpdateCategoryPayload);
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="category-name">
          Nombre
        </label>
        <input
          id="category-name"
          name="name"
          defaultValue={initialName}
          className="h-10 w-full rounded-md border px-3 text-sm"
          placeholder="Nombre de la categoría"
          maxLength={100}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="category-description">
          Descripción
        </label>
        <textarea
          id="category-description"
          name="description"
          defaultValue={initialDescription ?? ""}
          className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Descripción opcional"
          maxLength={500}
          disabled={isSubmitting}
        />
      </div>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
