import React, { useEffect, useState } from "react";
import {
  customerService,
  type CustomerPayload,
  type CustomerListResponse,
} from "../services/customerService";
import type { Customer } from "../types/customer.types";
import { AxiosError } from "axios";

type Mode = "create" | "edit";

interface CustomerFormState {
  id?: string;
  name: string;
  address: string;
  mobile: string;
}

const emptyCustomerForm: CustomerFormState = {
  name: "",
  address: "",
  mobile: "",
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CustomerFormState, string>>
  >({});
  const [form, setForm] = useState<CustomerFormState>(emptyCustomerForm);
  const [mode, setMode] = useState<Mode>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<CustomerListResponse["meta"]>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const loadCustomers = async (
    searchText?: string,
    pageParam?: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customerService.getCustomers({
        search: searchText,
        page: pageParam ?? page,
        pageSize: meta.pageSize,
      });
      setCustomers(response.data);
      setMeta(response.meta);
    } catch {
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    if (debounceTimer) window.clearTimeout(debounceTimer);
    const timer = window.setTimeout(() => {
      void loadCustomers(value.trim() !== "" ? value : undefined, 1);
      setPage(1);
    }, 400);
    setDebounceTimer(timer);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    const errors: Partial<Record<keyof CustomerFormState, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    else if (form.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters.";

    if (!form.address.trim()) errors.address = "Address is required.";
    else if (form.address.trim().length < 5)
      errors.address = "Address must be at least 5 characters.";

    const mobile = form.mobile.trim();
    if (!mobile) errors.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(mobile))
      errors.mobile = "Must be 10 digits starting with 6, 7, 8, or 9.";

    setFormErrors(errors);
    return Object.keys(errors).length ? "invalid" : null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) return;

    setIsSubmitting(true);
    setError(null);

    const payload: CustomerPayload = {
      name: form.name.trim(),
      address: form.address.trim(),
      mobile: form.mobile.trim(),
    };

    try {
      if (mode === "create") {
        await customerService.createCustomer(payload);
      } else if (mode === "edit" && form.id) {
        await customerService.updateCustomer(form.id, payload);
      }
      setForm(emptyCustomerForm);
      setMode("create");
      void loadCustomers(search.trim() !== "" ? search : undefined, page);
    } catch (err: unknown) {
      let message = "Failed to save customer. Please try again.";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer): void => {
    setMode("edit");
    setForm({
      id: customer._id,
      name: customer.name,
      address: customer.address,
      mobile: customer.mobile,
    });
  };

  const handleDelete = async (id: string | undefined): Promise<void> => {
    if (!id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirmed) return;

    try {
      await customerService.deleteCustomer(id);
      void loadCustomers(search.trim() !== "" ? search : undefined, page);
    } catch {
      setError("Failed to delete customer. Please try again.");
    }
  };

  const handleCancelEdit = (): void => {
    setMode("create");
    setForm(emptyCustomerForm);
    setFormErrors({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Customers
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your customers and their contact information.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name or mobile"
                className="w-full px-4 py-3 pl-10 border-2 border-amber-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "create" ? "Add New Customer" : "Edit Customer"}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    required
                  />
                  {formErrors.mobile && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span>
                      {formErrors.mobile}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-all"
                  required
                />
                {formErrors.address && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <span>⚠</span>
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {isSubmitting
                    ? mode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : mode === "create"
                    ? "Create Customer"
                    : "Update Customer"}
                </button>
                {mode === "edit" && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 rounded-xl border-2 border-amber-300 text-sm font-semibold text-gray-700 bg-white hover:bg-amber-50 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Customers List
            </h2>
            {isLoading && (
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Mobile
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {customers.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-base font-medium">
                        No customers found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer._id ?? customer.name}
                      className="hover:bg-amber-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="max-w-xs truncate">
                          {customer.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                        {customer.mobile}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-amber-300 text-xs font-semibold text-gray-700 bg-amber-50 hover:bg-amber-100 transition-all"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-red-300 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
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

export default CustomersPage;
