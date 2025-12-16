import React, { useEffect, useMemo, useState } from "react";
import { customerService } from "../services/customerService";
import { saleService } from "../services/saleService";
import type { Customer } from "../types/customer.types";
import type { Sale } from "../types/sale.types";
import type { Item } from "../types/item.types";
import { itemService } from "../services/itemService";

const CustomerLedgerPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [ledger, setLedger] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = useMemo(
    () => ledger.reduce((acc, sale) => acc + sale.totalPrice, 0),
    [ledger]
  );

  const getItemName = (sale: Sale): string => {
    if (typeof sale.item === "string") {
      const item = items.find((i) => i._id === sale.item);
      return item ? item.name : sale.item;
    }
    return sale.item.name;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString();
  };

  const loadInitial = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const [customersRes, itemsRes] = await Promise.all([
        customerService.getCustomers({ page: 1, pageSize: 200 }),
        itemService.getItems({ page: 1, pageSize: 200 }),
      ]);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      // Preselect first customer if available
      if (customersRes.data.length > 0) {
        setSelectedCustomerId(customersRes.data[0]._id ?? "");
      }
    } catch {
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInitial();
  }, []);

  const loadLedger = async (customerId: string): Promise<void> => {
    if (!customerId) {
      setLedger([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await saleService.getCustomerLedger(customerId);
      setLedger(data);
    } catch {
      setError("Failed to load customer ledger. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      void loadLedger(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleCustomerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedCustomerId(event.target.value);
  };

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Customer Ledger</h1>
            <p className="text-gray-600 text-sm mt-1">
              View all transactions for a specific customer.
            </p>
          </div>
          
          {/* Customer Selector Card */}
          <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Customer
            </label>
            <div className="relative">
              <select
                value={selectedCustomerId}
                onChange={handleCustomerChange}
                className="w-full px-4 py-3 pr-10 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all appearance-none text-gray-800 font-medium"
              >
                {customers.length === 0 && <option value="">No customers</option>}
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
            
            {/* Customer Info Display */}
            {selectedCustomer && (
              <div className="mt-4 p-4 bg-linear-to-r from-amber-100 to-orange-100 rounded-xl border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-amber-300">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{selectedCustomer.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedCustomer.mobile}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{selectedCustomer.address}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

        {/* Transactions Table */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
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
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {ledger.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-base font-medium">No transactions for this customer.</p>
                    </td>
                  </tr>
                ) : (
                  ledger.map((sale) => (
                    <tr key={sale._id ?? `${sale.item}-${sale.date}`} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(sale.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {getItemName(sale)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {sale.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right whitespace-nowrap">
                        ₹ {sale.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {sale.customerName === "Cash" ? (
                            <>
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-green-700 font-medium">Cash</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <span className="text-blue-700 font-medium">{sale.customerName ?? "Cash"}</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Amount Footer */}
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-5 border-t-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-semibold text-gray-700">Total Amount</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">₹ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLedgerPage;