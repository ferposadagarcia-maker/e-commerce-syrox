"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Sale } from "@/types/sale";
import { ApiError, apiFetch } from "@/lib/api";
import { formatMXN } from "@/lib/currency";

function resolveError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function sumTotals(sales: Sale[]): number {
  return sales.reduce((sum, sale) => {
    const value = Number(sale.total);
    return Number.isNaN(value) ? sum : sum + value;
  }, 0);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface MetricCard {
  label: string;
  value: string;
  href: string;
  hint: string;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<Category[]>("/categories"),
      apiFetch<Product[]>("/products"),
      apiFetch<Sale[]>("/sales"),
    ])
      .then(([categoryData, productData, saleData]) => {
        if (!active) return;
        setCategories(categoryData);
        setProducts(productData);
        setSales(saleData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(resolveError(err, "Error desconocido al cargar el dashboard"));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recentSales = [...sales].slice(0, 5);
  const metrics: MetricCard[] = [
    {
      label: "Productos",
      value: products.length.toLocaleString("es-MX"),
      href: "/products",
      hint: "Productos registrados",
    },
    {
      label: "Categorías",
      value: categories.length.toLocaleString("es-MX"),
      href: "/categories",
      hint: "Categorías registradas",
    },
    {
      label: "Ventas",
      value: sales.length.toLocaleString("es-MX"),
      href: "/sales",
      hint: "Ventas registradas",
    },
    {
      label: "Ingresos",
      value: formatMXN(sumTotals(sales)),
      href: "/sales",
      hint: "Suma de ventas registradas",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight font-heading">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Panel administrativo de MÖÖN</p>
      </div>

      {error ? (
        <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando métricas...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Link
                key={metric.label}
                href={metric.href}
                className="border rounded-lg p-6 transition-colors hover:bg-muted/40"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-tight font-heading">
                Ventas recientes
              </h2>
              <Link
                href="/sales"
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              >
                Ver todas
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
                No hay ventas registradas aún.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="hidden grid-cols-12 gap-4 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
                  <div className="col-span-5">Venta</div>
                  <div className="col-span-4">Fecha</div>
                  <div className="col-span-2">Productos</div>
                  <div className="col-span-1 text-right">Total</div>
                </div>
                <div className="divide-y">
                  {recentSales.map((sale) => {
                    const units = sale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    return (
                      <div
                        key={sale.id}
                        className="grid grid-cols-1 gap-2 px-6 py-4 text-sm md:grid-cols-12 md:gap-4 md:items-center"
                      >
                        <div className="font-mono text-xs md:col-span-5">
                          {sale.id.slice(0, 8)}
                        </div>
                        <div className="text-muted-foreground md:col-span-4">
                          {formatDate(sale.createdAt)}
                        </div>
                        <div className="text-muted-foreground md:col-span-2">
                          {units} {units === 1 ? "unidad" : "unidades"}
                        </div>
                        <div className="font-medium tabular-nums md:col-span-1 md:text-right">
                          {formatMXN(sale.total)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
