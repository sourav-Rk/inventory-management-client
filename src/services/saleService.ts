import api from "../api/axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { Sale, CreateSalePayload } from "../types/sale.types";

export interface SaleListResponse {
  data: Sale[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SaleListQuery {
  page?: number;
  pageSize?: number;
}

export const saleService = {
  async createSale(payload: CreateSalePayload): Promise<Sale> {
    const response = await api.post<{ success: boolean; data: Sale }>(
      API_ENDPOINTS.SALES.BASE,
      payload
    );
    return response.data.data;
  },

  async getSales(query?: SaleListQuery): Promise<SaleListResponse> {
    const response = await api.get<SaleListResponse>(API_ENDPOINTS.SALES.BASE, {
      params: query,
    });
    return response.data;
  },

  async getCustomerLedger(customerId: string): Promise<Sale[]> {
    const response = await api.get<{ success: boolean; data: Sale[] }>(
      API_ENDPOINTS.SALES.GET_BY_CUSTOMER(customerId)
    );
    return response.data.data;
  },
};


