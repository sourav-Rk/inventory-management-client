export const API_BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  ITEMS: {
    BASE: "/items",
    GET_BY_ID: (id: string) => `/items/${id}`,
  },
  CUSTOMERS: {
    BASE: "/customers",
    GET_BY_ID: (id: string) => `/customers/${id}`,
  },
  SALES: {
    BASE: "/sales",
    GET_BY_CUSTOMER: (customerId: string) => `/sales/customer/${customerId}`,
  },
  REPORTS: {
    DASHBOARD: "/reports/dashboard",
    SALES: "/reports/sales",
    INVENTORY: "/reports/inventory",
  },
};
