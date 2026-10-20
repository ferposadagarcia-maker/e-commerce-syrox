"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";
import type { Product } from "@/types/product";
import { ApiError, apiFetch } from "@/lib/api";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryAccordion } from "@/components/categories/category-accordion";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type FormMode = "create" | "edit" | null;

function resolveError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchData(): Promise<[Category[], Product[]]> {
    return Promise.all([
      apiFetch<Category[]>("/categories?includeArchived=true"),
      apiFetch<Product[]>("/products?includeArchived=true"),
    ]);
  }

  useEffect(() => {
    let active = true;
    fetchData()
      .then(([categoryData, productData]) => {
        if (!active) return;
        setCategories(categoryData);
        setProducts(productData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(resolveError(err, "Error desconocido al cargar categorías"));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const list = map.get(product.categoryId) ?? [];
      list.push(product);
      map.set(product.categoryId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [products]);

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

  async function handleCreate(
    payload: CreateCategoryPayload | UpdateCategoryPayload,
  ) {
    if (payload.name === undefined) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
        } as CreateCategoryPayload),
      });
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      closeForm();
    } catch (err) {
      setError(resolveError(err, "Error al crear categoría"));
      setSubmitting(false);
    }
  }

  async function handleUpdate(
    payload: CreateCategoryPayload | UpdateCategoryPayload,
  ) {
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await apiFetch<Category>(`/categories/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setCategories((prev) =>
        prev
          .map((category) => (category.id === updated.id ? updated : category))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      closeForm();
    } catch (err) {
      setError(resolveError(err, "Error al actualizar categoría"));
      setSubmitting(false);
    }
  }

  async function setCategoryActive(category: Category, isActive: boolean) {
    setBusyId(category.id);
    setError(null);
    try {
      const updated = await apiFetch<Category>(
        `/categories/${category.id}/${isActive ? "restore" : "archive"}`,
        { method: "PATCH" },
      );
      setCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(resolveError(err, "Error al actualizar la categoría"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.name}"? Esta acción es permanente. ` +
        `Si tiene productos, archívala en su lugar.`,
    );
    if (!confirmed) return;
    setBusyId(category.id);
    setError(null);
    try {
      await apiFetch<void>(`/categories/${category.id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "No se puede eliminar una categoría con productos. Archívala para retirarla del catálogo.",
        );
      } else {
        setError(resolveError(err, "Error al eliminar categoría"));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MÖÖN / CATEGORÍAS"
        title="Categorías"
        description="Organiza tus productos por categoría."
        actions={
          <Button onClick={openCreate} disabled={submitting}>
            Nueva categoría
          </Button>
        }
      />

      {error ? (
        <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {formMode !== null ? (
        <CategoryForm
          open={formMode !== null}
          onOpenChange={(next) => {
            if (!next) closeForm();
          }}
          mode={formMode}
          initialName={editing?.name}
          initialDescription={editing?.description}
          onSubmit={formMode === "edit" ? handleUpdate : handleCreate}
          isSubmitting={submitting}
        />
      ) : null}

      {loading ? (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando categorías...
        </div>
      ) : (
        <CategoryAccordion
          categories={categories}
          productsByCategory={productsByCategory}
          onEdit={openEdit}
          onDelete={handleDelete}
          onArchive={(category) => setCategoryActive(category, false)}
          onRestore={(category) => setCategoryActive(category, true)}
          busyId={busyId}
        />
      )}
    </div>
  );
}
