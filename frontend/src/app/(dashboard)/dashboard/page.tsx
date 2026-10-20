"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Sale } from "@/types/sale";
import { ApiError, apiFetch } from "@/lib/api";
import { formatMXN } from "@/lib/currency";
import { PageHeader } from "@/components/layout/page-header";
import {
  Package,
  List,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

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
  icon: LucideIcon;
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
      icon: Package,
    },
    {
      label: "Categorías",
      value: categories.length.toLocaleString("es-MX"),
      href: "/categories",
      hint: "Categorías registradas",
      icon: List,
    },
    {
      label: "Ventas",
      value: sales.length.toLocaleString("es-MX"),
      href: "/sales",
      hint: "Ventas registradas",
      icon: ShoppingCart,
    },
    {
      label: "Ingresos",
      value: formatMXN(sumTotals(sales)),
      href: "/sales",
      hint: "Suma de ventas registradas",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="MÖÖN / RESUMEN"
        title="Resumen general"
      />

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Cargando métricas...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, href, hint, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </p>
                  <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-4 font-heading text-3xl font-semibold tabular-nums tracking-tight">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[0.6875rem] uppercase tracking-[0.32em] text-muted-foreground">
                  MÖÖN / ACTIVIDAD
                </p>
                <h2 className="font-heading text-xl font-medium tracking-tight">
                  Ventas recientes
                </h2>
              </div>
              <Link
                href="/sales"
                className="shrink-0 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Ver todas
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                Todavía no hay ventas registradas.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="hidden grid-cols-12 gap-4 bg-muted px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground md:grid">
                  <div className="col-span-5">Venta</div>
                  <div className="col-span-4">Fecha</div>
                  <div className="col-span-2">Productos</div>
                  <div className="col-span-1 text-right">Total</div>
                </div>
                <div className="divide-y divide-border">
                  {recentSales.map((sale) => {
                    const units = sale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    );
                    return (
                      <div
                        key={sale.id}
                        className="grid grid-cols-1 gap-2 bg-table-row px-6 py-4 text-sm transition-colors hover:bg-accent/40 md:grid-cols-12 md:gap-4 md:items-center"
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
                        <div className="font-heading font-semibold tabular-nums md:col-span-1 md:text-right">
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
