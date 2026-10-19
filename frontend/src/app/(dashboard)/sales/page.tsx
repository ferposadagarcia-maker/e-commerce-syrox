"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import type { CreateSalePayload, Sale } from "@/types/sale";
import { ApiError, apiFetch } from "@/lib/api";
import { SaleTable } from "@/components/sales/sale-table";
import { SaleDetailSheet } from "@/components/sales/sale-detail-sheet";
import { SaleFormSheet } from "@/components/sales/sale-form-sheet";

function resolveError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<Sale | null>(null);

  async function fetchData(): Promise<[Sale[], Product[]]> {
    return Promise.all([
      apiFetch<Sale[]>("/sales"),
      apiFetch<Product[]>("/products"),
    ]);
  }

  useEffect(() => {
    let active = true;
    fetchData()
      .then(([saleData, productData]) => {
        if (!active) return;
        setSales(saleData);
        setProducts(productData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(resolveError(err, "Error desconocido al cargar ventas"));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(payload: CreateSalePayload) {
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch<Sale>("/sales", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSales((prev) => [created, ...prev]);
      setFormOpen(false);
    } catch (err) {
      setError(resolveError(err, "Error al registrar la venta"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight font-[family-name:var(--font-space-grotesk)]">
            Ventas
          </h1>
          <p className="text-muted-foreground">Historial y registro de ventas</p>
        </div>
        <button
          className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          onClick={() => setFormOpen(true)}
          disabled={submitting}
        >
          Generar Venta
        </button>
      </div>

      {error ? (
        <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando ventas...
        </div>
      ) : (
        <SaleTable sales={sales} onViewDetail={setDetail} />
      )}

      <SaleFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        products={products}
        onSubmit={handleCreate}
        isSubmitting={submitting}
      />

      <SaleDetailSheet
        sale={detail}
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      />
    </div>
  );
}
