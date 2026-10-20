import { Suspense } from "react";
import { ProductsClient } from "@/components/products/products-client";

async function ProductsWithParams({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const params = await searchParams;
  const editParam = params.edit;
  const editId = Array.isArray(editParam) ? editParam[0] : (editParam ?? null);

  return <ProductsClient editId={editId} />;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Cargando productos...
        </div>
      }
    >
      <ProductsWithParams searchParams={searchParams} />
    </Suspense>
  );
}
