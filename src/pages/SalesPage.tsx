import React, { useEffect, useMemo, useState } from "react";
import { saleService, type SaleListResponse } from "../services/saleService";
import { itemService } from "../services/itemService";
import { customerService } from "../services/customerService";
import type { Item } from "../types/item.types";
import type { Customer } from "../types/customer.types";
import type { CreateSalePayload, Sale } from "../types/sale.types";

interface SaleFormState {
  itemId: string;
  customerId: string;
  isCash: boolean;
  quantity: number;
  date: string;
}

const emptySaleForm = (): SaleFormState => ({
  itemId: "",
  customerId: "",
  isCash: true,
  quantity: 1,
  date: new Date().toISOString().split("T")[0],
});

const SalesPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [meta, setMeta] = useState<SaleListResponse["meta"]>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);

  const [form, setForm] = useState<SaleFormState>(() => emptySaleForm());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((i) => i._id === form.itemId),
    [items, form.itemId]
  );

  const totalPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.price * form.quantity;
  }, [selectedItem, form.quantity]);

  const loadInitialData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const [itemsRes, customersRes, salesRes] = await Promise.all([
        itemService.getItems({ page: 1, pageSize: 200 }),
        customerService.getCustomers({ page: 1, pageSize: 200 }),
        saleService.getSales({ page, pageSize: meta.pageSize }),
      ]);
      setItems(itemsRes.data);
      setCustomers(customersRes.data);
      setSales(salesRes.data);
      setMeta(salesRes.meta);
    } catch {
      setError("Failed to load sales data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "quantity") {
      setForm((prev) => ({
        ...prev,
        quantity: Number(value) || 1,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!form.itemId) return "Please select an item.";
    if (!form.isCash && !form.customerId)
      return "Please select a customer or choose Cash.";
    if (form.quantity <= 0) return "Quantity must be at least 1.";
    if (!selectedItem) return "Selected item not found.";
    if (selectedItem.quantity < form.quantity)
      return "Insufficient stock for the selected item.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateSalePayload = {
      item: form.itemId,
      quantity: form.quantity,
      date: form.date,
    };

    if (form.isCash) {
      payload.customerName = "Cash";
    } else {
      payload.customer = form.customerId;
      const customer = customers.find((c) => c._id === form.customerId);
      if (customer) {
        payload.customerName = customer.name;
      }
    }

    try {
      await saleService.createSale(payload);
      setForm(emptySaleForm());
      // Reload items (stock changed) and sales history
      const [itemsRes, salesRes] = await Promise.all([
        itemService.getItems({ page: 1, pageSize: 200 }),
        saleService.getSales({ page, pageSize: meta.pageSize }),
      ]);
      setItems(itemsRes.data);
      setSales(salesRes.data);
      setMeta(salesRes.meta);
    } catch (err) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? (err.response.data.message as string)
          : "Failed to create sale. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString();
  };

  const getItemDisplayName = (sale: Sale): string => {
    if (!sale.item) return "Unknown";
    if (typeof sale.item === "string") {
      const item = items.find((i) => i._id === sale.item);
      return item?.name ?? sale.item;
    }
    return sale.item.name ?? "Unknown";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Sales</h1>
            <p className="text-gray-600 text-sm mt-1">
              Record new sales and review recent transactions.
            </p>
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

        {/* Sale Form */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200">
            <h2 className="text-xl font-semibold text-gray-800">New Sale</h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item
                </label>
                <div className="relative">
                  <select
                    name="itemId"
                    value={form.itemId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-10 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all appearance-none"
                    required
                  >
                    <option value="">Select item</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} (Stock: {item.quantity})
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    value={form.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <label className="inline-flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCash"
                    checked={form.isCash}
                    onChange={handleInputChange}
                    className="mr-3 w-5 h-5 rounded border-2 border-amber-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cash Sale
                  </span>
                </label>
              </div>

              {!form.isCash && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer
                  </label>
                  <div className="relative">
                    <select
                      name="customerId"
                      value={form.customerId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-10 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all appearance-none"
                      required={!form.isCash}
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} ({customer.mobile})
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="bg-linear-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl px-5 py-4 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-700">Total Amount</span>
                <span className="text-2xl font-bold text-gray-800">
                  ₹ {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="w-full px-6 py-4 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white text-base font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Record Sale
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sales History */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Sales
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
                {sales.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <p className="text-base font-medium">No sales recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale._id ?? `${sale.item}-${sale.date}`} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {getItemDisplayName(sale)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {sale.customerName ?? "Cash"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right whitespace-nowrap">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right whitespace-nowrap">
                        ₹ {sale.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-t-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
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
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
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

export default SalesPage;