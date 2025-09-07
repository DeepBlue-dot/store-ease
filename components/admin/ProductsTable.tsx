"use client";

import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatCurrency } from "@/lib/utils";
import {
  extractImageUrls,
  getFirstImageUrl,
  handleImageError,
  isValidUrl,
} from "@/lib/image-utils";

interface ProductsTableProps {
  products: any[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  // Debug: Log product images to console
  if (typeof window !== "undefined" && products.length > 0) {
    console.log(
      "Products with images:",
      products.map((p) => ({
        name: p.name,
        rawImages: p.images,
        extractedUrls: extractImageUrls(p.images),
        hasValidImages: extractImageUrls(p.images).length > 0,
      }))
    );
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black font-bold tracking-tight">
            Products
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your store's product inventory
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"
                        />
                      </svg>
                      <p className="text-lg font-medium mb-2">
                        No products found
                      </p>
                      <p className="text-sm">
                        Get started by adding your first product
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const imageUrls = extractImageUrls(product.images);
                  const firstImageUrl = getFirstImageUrl(product.images);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {firstImageUrl ? (
                              <>
                                <img
                                  src={firstImageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover border"
                                  onError={handleImageError}
                                  loading="lazy"
                                />
                                <div className="image-fallback w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center hidden">
                                  <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}

                            {/* Image count badge */}
                            {imageUrls.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                +{imageUrls.length - 1}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {product.description.slice(0, 60)}...
                            </div>
                            {/* Debug info - remove in production */}
                            <div className="text-xs text-gray-400 mt-1">
                              {imageUrls.length > 0
                                ? `${imageUrls.length} image(s)`
                                : "No images"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rest of your table cells remain the same */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : product.status === "INACTIVE"
                              ? "bg-gray-100 text-gray-800"
                              : product.status === "DISCONTINUED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
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
                          </Link>

                          <DeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {products.length}
              </div>
              <div className="text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter((p) => p.status === "ACTIVE").length}
              </div>
              <div className="text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter((p) => p.stock < 10 && p.stock > 0).length}
              </div>
              <div className="text-gray-600">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter((p) => p.stock === 0).length}
              </div>
              <div className="text-gray-600">Out of Stock</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
