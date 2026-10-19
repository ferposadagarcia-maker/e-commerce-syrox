import type { Category } from "./category";

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}
