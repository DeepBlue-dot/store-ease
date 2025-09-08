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
}

export default function AdminProductInfoPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`/api/products/${params.id}`, {
          params: { include: "images,category" },
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
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-40 w-full mb-6" />
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-900 text-2xl font-bold">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-gray-900">
          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-sm text-gray-700">Price</p>
              <p className="text-lg">${Number(product.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-700">Stock</p>
              <p className="text-lg">{product.stock}</p>
            </div>
          </div>

          <Separator />

          {/* Status & Category */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-sm text-gray-700">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                {product.status}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-700">Category</p>
              <p className="text-lg">
                {product.category?.name ?? "Uncategorized"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-2">
              Description
            </p>
            <p className="text-gray-800 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Images */}
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-2">
              Product Images
            </p>
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
                <p className="text-sm text-gray-500">
                  No images available for this product.
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              onClick={() =>
                (window.location.href = `/admin/products/${product.id}/edit`)
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
