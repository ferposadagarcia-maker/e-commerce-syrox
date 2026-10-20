"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types/category";
import type { CreateProductPayload, UpdateProductPayload } from "@/types/product";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProductFormProps {
  categories: Category[];
  initialName?: string;
  initialDescription?: string | null;
  initialPrice?: string;
  initialCategoryId?: string;
  initialImageUrl?: string | null;
  onSubmit: (
    data: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) => void;
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
  initialImageUrl = null,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: ProductFormProps) {
  const hasCategories = categories.length > 0;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    setImageError(null);
    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Formato no permitido. Usa JPEG, PNG o WebP.");
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("La imagen supera el tamaño máximo de 5 MB.");
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearSelection() {
    setImageFile(null);
    setPreviewUrl(null);
    setImageError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const shownImage = previewUrl ?? initialImageUrl;

  return (
    <form
      className="space-y-4 border rounded-lg p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (imageError) {
          return;
        }
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
        onSubmit(payload, imageFile);
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

      <div className="space-y-3 rounded-md border border-dashed p-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Imagen del producto</p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG o WebP. Máximo 5 MB. Opcional.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
            {shownImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shownImage}
                alt="Previsualización del producto"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-2 text-center text-xs text-muted-foreground">
                Sin imagen
              </span>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={inputRef}
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:bg-background file:px-2 file:py-1 file:text-xs file:font-medium hover:file:bg-accent"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              disabled={isSubmitting}
            />
            {imageFile ? (
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={clearSelection}
                disabled={isSubmitting}
              >
                Quitar selección
              </button>
            ) : null}
            {imageError ? (
              <p className="text-xs text-destructive">{imageError}</p>
            ) : null}
          </div>
        </div>
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
