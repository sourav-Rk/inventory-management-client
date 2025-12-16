import api from "../api/axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type {
  SalesReportEntry,
  InventoryReportEntry,
  SalesReportResponse,
  InventoryReportResponse,
  SalesReportEmailPayload,
} from "../types/report.types";

export type ReportFormat = "pdf" | "excel";

export interface SalesReportQuery {
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface InventoryReportQuery {
  page?: number;
  pageSize?: number;
  range?: string;
  customFrom?: string;
  customTo?: string;
}

export const reportService = {
  async getSalesReport(
    query: SalesReportQuery
  ): Promise<SalesReportResponse> {
    const response = await api.get<{
      success: boolean;
      data: SalesReportEntry[];
      meta: SalesReportResponse["meta"];
      totals: SalesReportResponse["totals"];
    }>(`${API_ENDPOINTS.REPORTS.SALES}`, {
      params: query,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
      totals: response.data.totals,
    };
  },

  async getInventoryReport(
    query?: InventoryReportQuery
  ): Promise<InventoryReportResponse> {
    const response = await api.get<{
      success: boolean;
      data: InventoryReportEntry[];
      meta: InventoryReportResponse["meta"];
      totals: InventoryReportResponse["totals"];
    }>(`${API_ENDPOINTS.REPORTS.INVENTORY}`, {
      params: query,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
      totals: response.data.totals,
    };
  },

  async downloadSalesReport(
    format: ReportFormat,
    query?: SalesReportQuery
  ): Promise<void> {
    const response = await api.get(
      `${API_ENDPOINTS.REPORTS.SALES}?format=${format}`,
      {
        params: query,
        responseType: "blob",
      }
    );
    const filename =
      format === "pdf" ? "sales-report.pdf" : "sales-report.xlsx";
    triggerDownload(response.data, filename);
  },

  async downloadInventoryReport(format: ReportFormat): Promise<void> {
    const response = await api.get(
      `${API_ENDPOINTS.REPORTS.INVENTORY}?format=${format}`,
      { responseType: "blob" }
    );
    const filename =
      format === "pdf" ? "inventory-report.pdf" : "inventory-report.xlsx";
    triggerDownload(response.data, filename);
  },

  async sendSalesReportEmail(payload: SalesReportEmailPayload): Promise<void> {
    await api.post(`${API_ENDPOINTS.REPORTS.SALES}/email`, payload);
  },
};

function triggerDownload(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}


