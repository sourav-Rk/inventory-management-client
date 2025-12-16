import type { Item } from "./item.types";

export interface Sale {
  _id?: string;
  // Backend may return either the item id or a populated Item object
  item: string | Item;
  customer?: string; // Customer ID (optional)
  customerName?: string; // Snapshot name or \"Cash\"
  quantity: number;
  totalPrice: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSalePayload {
  item: string;
  customer?: string;
  customerName?: string;
  quantity: number;
  date?: string;
}


