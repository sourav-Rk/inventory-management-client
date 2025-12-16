
import React, { useEffect, useMemo, useState } from "react";
import { reportService } from "../services/reportService";
import type {
  InventoryReportEntry,
} from "../types/report.types";
import type { InventoryReportQuery } from "../services/reportService";

const LOW_STOCK_THRESHOLD = 5;
const PAGE_SIZE = 20;

type DateRange = "all" | "today" | "month" | "year" | "custom";

const ItemsReportPage: React.FC = () => {
  const [range, setRange] = useState<DateRange>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<InventoryReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [totals, setTotals] = useState({
    totalInventoryValue: 0,
    totalSalesCount: 0,
    totalSoldQuantity: 0,
    totalSoldValue: 0,
    maxSoldItemName: "",
    maxSoldQuantity: 0,
  });

  const buildQuery = (): InventoryReportQuery => {
    const query: InventoryReportQuery = {
      page,
      pageSize: PAGE_SIZE,
      range,
    };
    if (range === "custom") {
      if (customFrom) query.customFrom = customFrom;
      if (customTo) query.customTo = customTo;
    }
    return query;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const query: InventoryReportQuery = buildQuery();
        const report = await reportService.getInventoryReport(query);
        setData(report.data);
        setMeta(report.meta);
        setTotals(report.totals);
      } catch {
        setError("Failed to load inventory report.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [page, range, customFrom, customTo]);

  const totalValue = useMemo(() => totals.totalInventoryValue, [totals]);

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await reportService.downloadInventoryReport(format);
    } catch {
      setError("Failed to export inventory report.");
    }
  };

  return (
    <div className="p-8 bg-linear-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Items Report</h1>
        <p className="text-gray-600">
          Inventory overview with low stock highlights.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {(["all", "today", "month", "year", "custom"] as DateRange[]).map((r) => (
          <button
            key={r}
            onClick={() => {
              setRange(r);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
              range === r
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-700 border-amber-300 hover:bg-amber-50"
            }`}
          >
            {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}

        {range === "custom" && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-gray-600 text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => handleExport("pdf")}
            className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-amber-300 bg-amber-50 text-sm font-semibold text-gray-700 hover:bg-amber-100 transition-all"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-amber-300 bg-amber-50 text-sm font-semibold text-gray-700 hover:bg-amber-100 transition-all"
          >
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-amber-200">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Total Inventory Value
          </div>
          <div className="text-2xl font-bold text-gray-800">
            ₹ {totals.totalInventoryValue}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-amber-200">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Total Sales
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {totals.totalSalesCount}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-amber-200">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Sold Quantity
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {totals.totalSoldQuantity}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-amber-200">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Sold Value
          </div>
          <div className="text-2xl font-bold text-gray-800">
            ₹ {totals.totalSoldValue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-amber-200">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Top Seller
          </div>
          <div className="text-lg font-bold text-gray-800">
            {totals.maxSoldItemName || "-"}
          </div>
          <div className="text-sm text-gray-600">
            Sold: {totals.maxSoldQuantity}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {data.some((item) => item.quantity < LOW_STOCK_THRESHOLD) && (
        <div className="mb-6 p-4 bg-orange-100 border-2 border-orange-300 rounded-lg">
          <div className="font-semibold text-orange-800 mb-1">
            Low Stock Alert
          </div>
          <div className="text-sm text-orange-700">
            Some items are running low on stock (below {LOW_STOCK_THRESHOLD}{" "}
            units). Please restock soon.
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md border-2 border-amber-200 overflow-hidden mb-6">
        <div className="p-6 border-b-2 border-amber-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Snapshot
          </h2>
        </div>

        {isLoading && (
          <div className="p-8 text-center text-gray-600">Loading...</div>
        )}

        <table className="w-full">
          <thead className="bg-amber-100">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Description
              </th>
              <th className="text-right p-4 font-semibold text-gray-700">
                Quantity
              </th>
              <th className="text-right p-4 font-semibold text-gray-700">
                Price
              </th>
              <th className="text-right p-4 font-semibold text-gray-700">
                Total Value
              </th>
              <th className="text-right p-4 font-semibold text-gray-700">
                Sold Qty
              </th>
              <th className="text-right p-4 font-semibold text-gray-700">
                Sold Value
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No inventory data available.
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const isLowStock = row.quantity < LOW_STOCK_THRESHOLD;
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-amber-50 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isLowStock && (
                          <span className="text-red-500 font-bold">⚠️</span>
                        )}
                        <span className="font-semibold text-gray-800">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {row.description || "-"}
                    </td>
                    <td className="p-4 text-right text-gray-800">
                      {row.quantity}
                    </td>
                    <td className="p-4 text-right text-gray-800">
                      ₹ {row.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-gray-800">
                      ₹ {(row.price * row.quantity).toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-gray-800">
                      {row.soldQuantity ?? 0}
                    </td>
                    <td className="p-4 text-right text-gray-800">
                      ₹ {(row.soldValue ?? 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Total Footer */}
        <div className="bg-amber-100 p-4 flex justify-between items-center border-t-2 border-amber-200">
          <div className="font-semibold text-gray-700">
            Total Inventory Value
          </div>
          <div className="text-xl font-bold text-gray-800">₹ {totalValue}</div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Page {meta.page} of {meta.totalPages} ({meta.total} total items)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border-2 border-amber-300 bg-white text-sm font-semibold text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="px-4 py-2 rounded-lg border-2 border-amber-300 bg-white text-sm font-semibold text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemsReportPage;