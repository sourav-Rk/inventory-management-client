import api from "../api/axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { Customer } from "../types/customer.types";

export interface CustomerPayload {
  name: string;
  address: string;
  mobile: string;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export const customerService = {
  async getCustomers(query?: CustomerListQuery): Promise<CustomerListResponse> {
    const response = await api.get<CustomerListResponse>(
      API_ENDPOINTS.CUSTOMERS.BASE,
      { params: query }
    );
    return response.data;
  },

  async getCustomerById(id: string): Promise<Customer> {
    const response = await api.get<{ success: boolean; data: Customer }>(
      API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id)
    );
    return response.data.data;
  },

  async createCustomer(payload: CustomerPayload): Promise<Customer> {
    const response = await api.post<{ success: boolean; data: Customer }>(
      API_ENDPOINTS.CUSTOMERS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateCustomer(
    id: string,
    payload: CustomerPayload
  ): Promise<Customer> {
    const response = await api.put<{ success: boolean; data: Customer }>(
      API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id)
    );
  },
};


