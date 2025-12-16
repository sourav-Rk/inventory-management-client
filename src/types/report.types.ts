export interface SalesReportEntry {
  date: string;
  item: string;
  quantity: number;
  totalPrice: number;
  customer: string;
}

export interface InventoryReportEntry {
  name: string;
  quantity: number;
  price: number;
  description?: string;
  soldQuantity?: number;
  soldValue?: number;
}

export interface SalesReportMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SalesReportTotals {
  totalSales: number;
  totalRevenue: number;
  avgSale: number;
}

export interface SalesReportResponse {
  data: SalesReportEntry[];
  meta: SalesReportMeta;
  totals: SalesReportTotals;
}

export interface SalesReportEmailPayload {
  to: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InventoryReportMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface InventoryReportTotals {
  totalInventoryValue: number;
  totalSalesCount: number;
  totalSoldQuantity: number;
  totalSoldValue: number;
  maxSoldItemName: string;
  maxSoldQuantity: number;
}

export interface InventoryReportResponse {
  data: InventoryReportEntry[];
  meta: InventoryReportMeta;
  totals: InventoryReportTotals;
}


