import React, { useEffect, useMemo, useState } from "react";
import { reportService } from "../services/reportService";
import type { SalesReportEntry, SalesReportResponse } from "../types/report.types";
import type { SalesReportQuery } from "../services/reportService";

type QuickRange = "all" | "today" | "month" | "year" | "custom";
const PAGE_SIZE = 10;

const SalesReportPage: React.FC = () => {
  const [data, setData] = useState<SalesReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickRange, setQuickRange] = useState<QuickRange>("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [isEmailing, setIsEmailing] = useState(false);
  const [meta, setMeta] = useState<SalesReportResponse["meta"]>({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [totals, setTotals] = useState<SalesReportResponse["totals"]>({
    totalSales: 0,
    totalRevenue: 0,
    avgSale: 0,
  });

  const formatLocalDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};


const buildQuery = (): SalesReportQuery => {
  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let dateFrom: string | undefined;
  let dateTo: string | undefined;

  if (quickRange === "today") {
    dateFrom = formatLocalDate(startOfDay);
    dateTo = formatLocalDate(startOfDay);
  } else if (quickRange === "month") {
    dateFrom = formatLocalDate(startOfMonth);
  } else if (quickRange === "year") {
    dateFrom = formatLocalDate(startOfYear);
  } else if (quickRange === "custom") {
    dateFrom = customFrom || undefined;
    dateTo = customTo || undefined;
  }

  return {
    dateFrom,
    dateTo,
    page,
    pageSize: PAGE_SIZE,
  };
};


  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const query = buildQuery();
      const report = await reportService.getSalesReport(query);
      setData(report.data);
      setMeta(report.meta);
      setTotals(report.totals);
    } catch {
      setError("Failed to load sales report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickRange, customFrom, customTo, page]);

  const summary = useMemo(() => {
    return {
      totalSales: totals.totalSales,
      totalRevenue: totals.totalRevenue,
      avgSale: totals.avgSale,
    };
  }, [totals]);

  const formatDate = (dateString: string): string => {
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? dateString : d.toLocaleDateString();
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await reportService.downloadSalesReport(format);
    } catch {
      setError("Failed to export sales report.");
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError("Please enter a recipient email.");
      return;
    }
    try {
      setIsEmailing(true);
      setError(null);
      const query = buildQuery();
      await reportService.sendSalesReportEmail({
        to: email.trim(),
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });
    } catch {
      setError("Failed to send report via email.");
    } finally {
      setIsEmailing(false);
    }
  };

  const totalPages = meta.totalPages ?? 1;
  const pagedData = data;

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Sales Report</h1>
              <p className="text-gray-600 text-sm mt-1">
                Summary of all recorded sales with export options.
              </p>
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg p-4">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleExport("pdf")}
                  className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-amber-300 bg-amber-50 text-sm font-semibold text-gray-700 hover:bg-amber-100 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-amber-300 bg-amber-50 text-sm font-semibold text-gray-700 hover:bg-amber-100 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Excel
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 flex-1 lg:max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 px-4 py-2 border-2 border-amber-200 rounded-lg bg-amber-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={isEmailing}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md whitespace-nowrap"
                >
                  {isEmailing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg p-6 space-y-5">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Date Range</span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "All Time" },
                { key: "today", label: "Today" },
                { key: "month", label: "This Month" },
                { key: "year", label: "This Year" },
                { key: "custom", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setQuickRange(opt.key as QuickRange);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    quickRange === opt.key
                      ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md"
                      : "bg-amber-50 text-gray-700 border-2 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {quickRange === "custom" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Sales</p>
              <div className="w-10 h-10 bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {summary.totalSales}
            </p>
          </div>
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Revenue</p>
              <div className="w-10 h-10 bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              ₹ {summary.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Average Sale</p>
              <div className="w-10 h-10 bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              ₹ {summary.avgSale.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sales Records Table */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Sales Records
            </h2>
            {isLoading && (
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-amber-200">
              <thead className="bg-linear-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {meta.total === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-base font-medium">No sales data available.</p>
                    </td>
                  </tr>
                ) : (
                  pagedData.map((row, index) => (
                    <tr key={`${row.item}-${row.date}-${index}`} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.item}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {row.customer}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {row.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right whitespace-nowrap">
                        ₹ {row.totalPrice}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-t-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">
              Page {page} of {totalPages} ({meta.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border-2 border-amber-300 bg-white text-sm font-semibold text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border-2 border-amber-300 bg-white text-sm font-semibold text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportPage;