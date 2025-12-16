import api from "../api/axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { Item } from "../types/item.types";

export interface ItemPayload {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface ItemListResponse {
  data: Item[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ItemListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export const itemService = {
  async getItems(query?: ItemListQuery): Promise<ItemListResponse> {
    const response = await api.get<ItemListResponse>(API_ENDPOINTS.ITEMS.BASE, {
      params: query,
    });
    return response.data;
  },

  async getItemById(id: string): Promise<Item> {
    const response = await api.get<{ success: boolean; data: Item }>(
      API_ENDPOINTS.ITEMS.GET_BY_ID(id)
    );
    return response.data.data;
  },

  async createItem(payload: ItemPayload): Promise<Item> {
    const response = await api.post<{ success: boolean; data: Item }>(
      API_ENDPOINTS.ITEMS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateItem(id: string, payload: ItemPayload): Promise<Item> {
    const response = await api.put<{ success: boolean; data: Item }>(
      API_ENDPOINTS.ITEMS.GET_BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.ITEMS.GET_BY_ID(id)
    );
  },
};


