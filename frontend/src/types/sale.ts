export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: {
    id: string;
    name: string;
  };
}

export interface Sale {
  id: string;
  total: string;
  createdAt: string;
  items: SaleItem[];
}

export interface CreateSaleItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateSalePayload {
  items: CreateSaleItemPayload[];
}
