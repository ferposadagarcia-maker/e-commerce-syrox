"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function ProductsClient({ editId = null }: { editId?: string | null }) {
  const router = useRouter();
  const [initialEditId] = useState<string | null>(() => {
    if (editId) return editId;
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("edit");
  });
  // Al cerrar un deep link, ignoramos el id de la URL hasta que cambie, de modo
  // que `router.replace` no reabra el diálogo con el valor capturado al inicio.
  const [dismissedEditId, setDismissedEditId] = useState<string | null>(null);
  const urlEditId = editId ?? initialEditId;
  const activeEditId = urlEditId === dismissedEditId ? null : urlEditId;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  async function fetchData(): Promise<[Product[], Category[]]> {
    return Promise.all([
      apiFetch<Product[]>("/products?includeArchived=true"),
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

  // Deep link `/products?edit=<id>`: se resuelve durante el render, sin
  // sincronizar estado dentro de un efecto.
  const deepLinkProduct = activeEditId
    ? products.find((product) => product.id === activeEditId)
    : undefined;
  const deepLinkMissing = !loading && activeEditId !== null && !deepLinkProduct;

  const activeMode: FormMode = deepLinkProduct ? "edit" : formMode;
  const activeEditing: Product | null = deepLinkProduct ?? editing;

  const visibleProducts = useMemo(
    () => (showArchived ? products : products.filter((p) => p.isActive)),
    [products, showArchived],
  );

  const archivedCount = useMemo(
    () => products.filter((p) => !p.isActive).length,
    [products],
  );

  const formCategories = useMemo(() => {
    if (
      activeEditing &&
      !categories.some((c) => c.id === activeEditing.categoryId)
    ) {
      return [...categories, activeEditing.category].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }
    return categories;
  }, [categories, activeEditing]);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    if (urlEditId) setDismissedEditId(urlEditId);
    if (activeEditId) router.replace("/products");
  }

  function openEdit(product: Product) {
    setFormMode("edit");
    setEditing(product);
    if (urlEditId) setDismissedEditId(urlEditId);
    if (activeEditId) router.replace("/products");
  }

  function closeForm() {
    setFormMode(null);
    setEditing(null);
    setSubmitting(false);
    if (urlEditId) setDismissedEditId(urlEditId);
    if (activeEditId) router.replace("/products");
  }

  async function handleCreate(
    payload: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) {
    if (
      payload.name === undefined ||
      payload.price === undefined ||
      payload.categoryId === undefined
    ) {
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
        created = await apiUpload<Product>(
          `/products/${created.id}/image`,
          imageFile,
        );
      }
      setProducts((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
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
    if (!activeEditing) return;
    setSubmitting(true);
    setError(null);
    try {
      let updated = await apiFetch<Product>(`/products/${activeEditing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (imageFile) {
        updated = await apiUpload<Product>(
          `/products/${activeEditing.id}/image`,
          imageFile,
        );
      }
      setProducts((prev) =>
        prev
          .map((product) => (product.id === updated.id ? updated : product))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      closeForm();
    } catch (err) {
      setError(resolveError(err, "Error al actualizar producto"));
      setSubmitting(false);
    }
  }

  async function setProductActive(product: Product, isActive: boolean) {
    setBusyId(product.id);
    setError(null);
    try {
      const updated = await apiFetch<Product>(
        `/products/${product.id}/${isActive ? "restore" : "archive"}`,
        { method: "PATCH" },
      );
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(resolveError(err, "Error al actualizar el producto"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `¿Eliminar el producto "${product.name}"? Esta acción es permanente.`,
    );
    if (!confirmed) return;
    setBusyId(product.id);
    setError(null);
    try {
      await apiFetch<void>(`/products/${product.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "No se puede eliminar este producto porque está asociado a ventas registradas. Archívalo para retirarlo del catálogo.",
        );
      } else {
        setError(resolveError(err, "Error al eliminar producto"));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight font-heading">
            Productos
          </h1>
          <p className="text-muted-foreground">
            Gestión de productos del e-commerce
          </p>
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
          No hay categorías activas disponibles. Crea una primero en{" "}
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

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border"
          checked={showArchived}
          onChange={(event) => setShowArchived(event.target.checked)}
        />
        Mostrar productos archivados
        {archivedCount > 0 ? ` (${archivedCount})` : ""}
      </label>

      {deepLinkMissing ? (
        <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-md px-4 py-3 text-sm">
          No se encontró el producto solicitado (id &quot;{activeEditId}&quot;). Puede
          que haya sido eliminado o el enlace sea incorrecto.
        </div>
      ) : null}

      {formMode === "create" ? (
        <ProductForm
          open
          onOpenChange={(next) => {
            if (!next) closeForm();
          }}
          mode="create"
          categories={categories}
          onSubmit={handleCreate}
          isSubmitting={submitting}
        />
      ) : null}

      {activeMode === "edit" && activeEditing ? (
        <ProductForm
          open
          onOpenChange={(next) => {
            if (!next) closeForm();
          }}
          mode="edit"
          categories={formCategories}
          initialName={activeEditing.name}
          initialDescription={activeEditing.description}
          initialPrice={activeEditing.price}
          initialCategoryId={activeEditing.categoryId}
          initialImageUrl={activeEditing.imageUrl}
          onSubmit={handleUpdate}
          isSubmitting={submitting}
        />
      ) : null}

      {loading ? (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando productos...
        </div>
      ) : (
        <ProductTable
          products={visibleProducts}
          onEdit={openEdit}
          onDelete={handleDelete}
          onArchive={(product) => setProductActive(product, false)}
          onRestore={(product) => setProductActive(product, true)}
          isDeleting={busyId !== null}
          busyId={busyId}
        />
      )}
    </div>
  );
}
