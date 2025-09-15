"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  averageRating: number;
  category?: { id: string; name: string; imageUrl: string };
  images?: Array<{ id: string; url: string; createdAt: string }>;
}

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        )}
      />
    ));

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={product.images?.[0]?.url || "/placeholder.svg?height=200&width=200"}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            {product.stock === 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-xs">Out of Stock</Badge>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(product.averageRating)}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({product.averageRating})
                  </span>
                </div>
                <p className="text-muted-foreground mb-4 max-w-2xl">{product.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">${product.price}</span>
                  <Badge variant="outline">{product.category?.name || "Uncategorized"}</Badge>
                  <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="icon" variant="ghost" className="bg-gray-50 hover:bg-gray-100">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white" disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
