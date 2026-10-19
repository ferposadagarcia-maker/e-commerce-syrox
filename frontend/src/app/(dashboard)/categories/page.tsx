"use client";

import { useEffect, useState } from "react";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";
import { ApiError, apiFetch } from "@/lib/api";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryTable } from "@/components/categories/category-table";

type FormMode = "create" | "edit" | null;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCategories(): Promise<Category[]> {
    try {
      const data = await apiFetch<Category[]>("/categories");
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Error desconocido al cargar categorías");
    }
  }

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((data) => {
        if (!active) return;
        setCategories(data);
        setError(null);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
  }

  function openEdit(category: Category) {
    setFormMode("edit");
    setEditing(category);
  }

  function closeForm() {
    setFormMode(null);
    setEditing(null);
    setSubmitting(false);
  }

  async function handleCreate(payload: CreateCategoryPayload | UpdateCategoryPayload) {
    if (payload.name === undefined) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({ name: payload.name, description: payload.description } as CreateCategoryPayload),
      });
      setCategories((prev) => [created, ...prev]);
      closeForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al crear categoría");
      }
      setSubmitting(false);
    }
  }

  async function handleUpdate(payload: CreateCategoryPayload | UpdateCategoryPayload) {
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await apiFetch<Category>(`/categories/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setCategories((prev) =>
        prev.map((category) => (category.id === updated.id ? updated : category))
      );
      closeForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al actualizar categoría");
      }
      setSubmitting(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.name}"?`
    );
    if (!confirmed) return;
    setDeletingId(category.id);
    setError(null);
    try {
      await apiFetch<void>(`/categories/${category.id}`, {
        method: "DELETE",
      });
      setCategories((prev) =>
        prev.filter((item) => item.id !== category.id)
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al eliminar categoría");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight font-[family-name:var(--font-space-grotesk)]">
            Categorías
          </h1>
          <p className="text-muted-foreground">Gestión de categorías del e-commerce</p>
        </div>
        <button
          className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90"
          onClick={openCreate}
          disabled={submitting}
        >
          Nueva categoría
        </button>
      </div>

      {error ? (
        <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {formMode === "create" ? (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={closeForm}
          isSubmitting={submitting}
          submitLabel="Crear categoría"
        />
      ) : null}

      {formMode === "edit" && editing ? (
        <CategoryForm
          initialName={editing.name}
          initialDescription={editing.description}
          onSubmit={handleUpdate}
          onCancel={closeForm}
          isSubmitting={submitting}
          submitLabel="Guardar cambios"
        />
      ) : null}

      {loading ? (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando categorías...
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={openEdit}
          onDelete={handleDelete}
          isDeleting={deletingId !== null}
        />
      )}
    </div>
  );
}
