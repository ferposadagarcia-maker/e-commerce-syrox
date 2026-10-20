"use client";

import type { CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string | null;
  onSubmit: (data: CreateCategoryPayload | UpdateCategoryPayload) => void;
  isSubmitting: boolean;
}

export function CategoryForm({
  open,
  onOpenChange,
  mode,
  initialName = "",
  initialDescription = "",
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const isEdit = mode === "edit";

  return (
    <Dialog
      open={open}
      onOpenChange={(next, eventDetails) => {
        if (isSubmitting && !next) {
          eventDetails.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza la información de la categoría."
              : "Escribe el nombre de la categoría."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const name = String(formData.get("name") ?? "").trim();
            const descriptionRaw = formData.get("description");
            const description =
              descriptionRaw === null || String(descriptionRaw).trim() === ""
                ? undefined
                : String(descriptionRaw).trim();
            onSubmit({
              name,
              description,
            } as CreateCategoryPayload | UpdateCategoryPayload);
          }}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="category-name">
              Nombre
            </label>
            <input
              id="category-name"
              name="name"
              defaultValue={initialName}
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              placeholder="Nombre de la categoría"
              maxLength={100}
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              htmlFor="category-description"
            >
              Descripción
            </label>
            <textarea
              id="category-description"
              name="description"
              defaultValue={initialDescription ?? ""}
              className="min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              placeholder="Descripción opcional"
              maxLength={500}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              className="h-9 rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
