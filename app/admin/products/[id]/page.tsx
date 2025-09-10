"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  status: string;
  category?: { id: string; name: string } | null;
  images?: { url: string }[];
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  ratingsCount?: number;
}

export default function AdminProductInfoPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`/api/products/${params.id}`, {
          params: { include: "images,category,ratings" },
        });
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-red-600 font-medium">
        Product not found.
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-900";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "DISCONTINUED":
        return "bg-yellow-100 text-yellow-900";
      case "DELETED":
        return "bg-red-100 text-red-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const stockAlertColor = (stock: number) => {
    if (stock === 0) return "text-red-700 font-bold";
    if (stock <= 5) return "text-yellow-700 font-medium";
    return "text-green-700 font-medium";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="shadow-md border rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900 text-3xl font-bold">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-gray-900">

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-sm text-gray-700">Product ID</p>
              <p className="text-lg">{product.id}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-700">Category</p>
              <p className="text-lg">{product.category?.name ?? "Uncategorized"}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-700">Price</p>
              <p className="text-lg">${Number(product.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-700">Stock</p>
              <p className={`text-lg ${stockAlertColor(product.stock)}`}>{product.stock}</p>
            </div>
          </div>

          <Separator />

          {/* Status & Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-sm text-gray-700">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  product.status
                )}`}
              >
                {product.status}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-700">Created / Updated</p>
              <p className="text-sm text-gray-600">
                Created: {formatDateTime(product.createdAt)}
              </p>
              <p className="text-sm text-gray-600">
                Updated: {formatDateTime(product.updatedAt)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Ratings */}
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-1">Ratings</p>
            <p className="text-gray-800">
              Average: {product.averageRating?.toFixed(1) ?? "N/A"} ⭐ |{" "}
              {product.ratingsCount ?? 0} review{product.ratingsCount === 1 ? "" : "s"}
            </p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-1">Description</p>
            <p className="text-gray-800 leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Images */}
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-2">Product Images</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images?.length ? (
                product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Product image ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border hover:scale-105 transition-transform duration-200"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No images available.</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => (window.location.href = `/admin/products/${product.id}/edit`)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Product
            </Button>
            <Button
              onClick={() => (window.location.href = `/admin/products`)}
              className="bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
