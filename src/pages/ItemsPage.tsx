import React, { useEffect, useState } from "react";
import {
  itemService,
  type ItemPayload,
  type ItemListResponse,
} from "../services/itemService";
import type { Item } from "../types/item.types";
import { AxiosError } from "axios";

type Mode = "create" | "edit";

interface ItemFormState {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

const emptyForm: ItemFormState = {
  name: "",
  description: "",
  quantity: 0,
  price: 0,
};

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ItemFormState, string>>
  >({});
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [mode, setMode] = useState<Mode>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ItemListResponse["meta"]>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const loadItems = async (
    searchText?: string,
    pageParam?: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await itemService.getItems({
        search: searchText,
        page: pageParam ?? page,
        pageSize: meta.pageSize,
      });
      setItems(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
    const timer = window.setTimeout(() => {
      void loadItems(value.trim() !== "" ? value : undefined, 1);
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
      [name]:
        name === "quantity" || name === "price" ? Number(value) || 0 : value,
    }));
  };

  const validateForm = (): string | null => {
    const errors: Partial<Record<keyof ItemFormState, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (form.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters.";
    if (!form.description.trim())
      errors.description = "Description is required.";
    else if (form.description.trim().length < 20)
      errors.description = "Description must be at least 20 characters.";
    if (form.quantity <= 0)
      errors.quantity = "Quantity must be greater than 0.";
    if (form.price <= 0) errors.price = "Price must be greater than 0.";
    setFormErrors(errors);
    return Object.keys(errors).length ? "invalid" : null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) return;

    setIsSubmitting(true);
    setError(null);

    const payload: ItemPayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      quantity: form.quantity,
      price: form.price,
    };

    try {
      if (mode === "create") {
        await itemService.createItem(payload);
      } else if (mode === "edit" && form.id) {
        await itemService.updateItem(form.id, payload);
      }
      setForm(emptyForm);
      setMode("create");
      void loadItems(search.trim() !== "" ? search : undefined);
    } catch (err: unknown) {
      let message = "Failed to save item. Please try again.";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.error || err.response?.data?.message || message;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Item): void => {
    setMode("edit");
    setForm({
      id: item._id,
      name: item.name,
      description: item.description ?? "",
      quantity: item.quantity,
      price: item.price,
    });
  };

  const handleDelete = async (id: string | undefined): Promise<void> => {
    if (!id) return;
    const confirmed = window.confirm("Are you sure you want to delete item?");
    if (!confirmed) return;

    try {
      await itemService.deleteItem(id);
      void loadItems(search.trim() !== "" ? search : undefined, page);
    } catch {
      setError("Failed to delete item. Please try again.");
    }
  };

  const handleCancelEdit = (): void => {
    setMode("create");
    setForm(emptyForm);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-amber-700 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Manage your stock with precision and ease
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-amber-400"
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
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search items..."
                className="w-full pl-11 pr-4 py-3 border-2 border-amber-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md flex items-start gap-3 animate-pulse">
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
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl shadow-2xl p-6 md:p-8 hover:shadow-amber-200/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === "create"
                  ? "bg-linear-to-br from-green-400 to-emerald-500"
                  : "bg-linear-to-br from-blue-400 to-indigo-500"
              } shadow-lg`}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mode === "create" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                )}
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {mode === "create" ? "Add New Item" : "Edit Item"}
            </h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                  required
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-all duration-200"
                />
                {formErrors.description && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min={0}
                  value={form.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                  required
                />
                {formErrors.quantity && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.quantity}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                  required
                />
                {formErrors.price && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.price}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                  ? "Create Item"
                  : "Update Item"}
              </button>
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-xl border-2 border-amber-300 text-sm font-semibold text-gray-700 bg-white hover:bg-amber-50 transition-all duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl shadow-2xl overflow-hidden hover:shadow-amber-200/50 transition-all duration-300">
          <div className="px-6 py-4 border-b-2 border-amber-200 flex items-center justify-between bg-linear-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Items List
              </h2>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                <svg
                  className="w-4 h-4 animate-spin"
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
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-200 text-sm">
              <thead className="bg-linear-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">
                    Description
                  </th>
                  <th className="px-4 md:px-6 py-4 text-right font-bold text-gray-700 uppercase tracking-wider text-xs">
                    Quantity
                  </th>
                  <th className="px-4 md:px-6 py-4 text-right font-bold text-gray-700 uppercase tracking-wider text-xs">
                    Price
                  </th>
                  <th className="px-4 md:px-6 py-4 text-right font-bold text-gray-700 uppercase tracking-wider text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {items.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">
                          No items found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item._id ?? item.name}
                      className="hover:bg-amber-50/50 transition-colors duration-150"
                    >
                      <td className="px-4 md:px-6 py-4 text-gray-800 font-semibold whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-600 max-w-xs truncate">
                        {item.description || (
                          <span className="text-gray-400 italic">
                            No description
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          ₹ {item.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-blue-300 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all duration-150 hover:shadow-md"
                          >
                            <svg
                              className="w-3 h-3"
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
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-red-300 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-150 hover:shadow-md"
                          >
                            <svg
                              className="w-3 h-3"
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

          <div className="px-6 py-4 border-t-2 border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <svg
                className="w-4 h-4 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Page {meta.page} of {meta.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border-2 border-amber-300 bg-white text-sm font-semibold text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-md"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded-lg border-2 border-amber-300 bg-white text-sm font-semibold text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-md"
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

export default ItemsPage;
