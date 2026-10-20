"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types/category";
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "@/types/product";
import { ApiError, apiFetch, apiUpload } from "@/lib/api";
import { ProductForm } from "@/components/products/product-form";
import { ProductTable } from "@/components/products/product-table";

type FormMode = "create" | "edit" | null;

function resolveError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchData(): Promise<[Product[], Category[]]> {
    return Promise.all([
      apiFetch<Product[]>("/products"),
      apiFetch<Category[]>("/categories"),
    ]);
  }

  useEffect(() => {
    let active = true;
    fetchData()
      .then(([productData, categoryData]) => {
        if (!active) return;
        setProducts(productData);
        setCategories(categoryData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(resolveError(err, "Error desconocido al cargar productos"));
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

  function openEdit(product: Product) {
    setFormMode("edit");
    setEditing(product);
  }

  function closeForm() {
    setFormMode(null);
    setEditing(null);
    setSubmitting(false);
  }

  async function handleCreate(
    payload: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) {
    if (payload.name === undefined || payload.price === undefined || payload.categoryId === undefined) {
      setError("Nombre, precio y categoría son obligatorios.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let created = await apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          price: payload.price,
          categoryId: payload.categoryId,
        } as CreateProductPayload),
      });
      if (imageFile) {
        created = await apiUpload<Product>(`/products/${created.id}/image`, imageFile);
      }
      setProducts((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      closeForm();
    } catch (err) {
      setError(resolveError(err, "Error al crear producto"));
      setSubmitting(false);
    }
  }

  async function handleUpdate(
    payload: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) {
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      let updated = await apiFetch<Product>(`/products/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (imageFile) {
        updated = await apiUpload<Product>(`/products/${editing.id}/image`, imageFile);
      }
      setProducts((prev) =>
        prev
          .map((product) => (product.id === updated.id ? updated : product))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      closeForm();
    } catch (err) {
      setError(resolveError(err, "Error al actualizar producto"));
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `¿Eliminar el producto "${product.name}"?`
    );
    if (!confirmed) return;
    setDeletingId(product.id);
    setError(null);
    try {
      await apiFetch<void>(`/products/${product.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "No se puede eliminar este producto porque está asociado a ventas registradas. Conserva el producto o revisa el historial de ventas.",
        );
      } else {
        setError(resolveError(err, "Error al eliminar producto"));
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
            Productos
          </h1>
          <p className="text-muted-foreground">Gestión de productos del e-commerce</p>
        </div>
        <button
          className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          onClick={openCreate}
          disabled={submitting || categories.length === 0}
          title={
            categories.length === 0
              ? "Crea una categoría antes de registrar productos"
              : undefined
          }
        >
          Nuevo producto
        </button>
      </div>

      {categories.length === 0 && !loading ? (
        <div className="border rounded-md px-4 py-3 text-sm text-muted-foreground">
          No hay categorías disponibles. Crea una primero en{" "}
          <Link href="/categories" className="underline underline-offset-2">
            Categorías
          </Link>
          .
        </div>
      ) : null}

      {error ? (
        <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {formMode === "create" ? (
        <ProductForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={closeForm}
          isSubmitting={submitting}
          submitLabel="Crear producto"
        />
      ) : null}

      {formMode === "edit" && editing ? (
        <ProductForm
          categories={categories}
          initialName={editing.name}
          initialDescription={editing.description}
          initialPrice={editing.price}
          initialCategoryId={editing.categoryId}
          initialImageUrl={editing.imageUrl}
          onSubmit={handleUpdate}
          onCancel={closeForm}
          isSubmitting={submitting}
          submitLabel="Guardar cambios"
        />
      ) : null}

      {loading ? (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando productos...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={openEdit}
          onDelete={handleDelete}
          isDeleting={deletingId !== null}
        />
      )}
    </div>
  );
}
