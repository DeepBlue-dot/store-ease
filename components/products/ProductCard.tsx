"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  price: number
  stock?: number
  liked?: boolean
  averageRating?: number
  ratingsCount?: number
  category?: { id: string; name: string }
  images?: { id: string; url: string }[]
}

export function ProductCard({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false)
  const [liked, setLiked] = useState(product.liked || false)

  const productImage =
    product.images?.[0]?.url ||
    "/placeholder.svg?height=256&width=256&query=tech product"

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error("Out of stock!")
      return
    }

    setAdding(true)
    try {
      await axios.post("/api/cart", { productId: product.id, qty: 1 })
      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to add to cart.")
    } finally {
      setAdding(false)
    }
  }

  const toggleLike = () => setLiked(!liked)

  // Format rating stars
  const renderStars = () => {
    const fullStars = Math.floor(product.averageRating || 0)
    const halfStar = (product.averageRating || 0) - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    return (
      <div className="flex items-center gap-1">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400" />
          ))}
        {halfStar && <Star className="h-4 w-4 text-yellow-200" />}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
          ))}
        {product.ratingsCount !== undefined && (
          <span className="text-xs text-gray-500 ml-1">({product.ratingsCount})</span>
        )}
      </div>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 bg-white rounded-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative overflow-hidden">
          <Image
            src={productImage}
            alt={product.name}
            width={400}
            height={256}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />

          {/* Like button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            onClick={toggleLike}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                liked ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </Button>

          {/* Stock badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-4 flex flex-col justify-between h-56">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
              {product.name}
            </h3>

            {/* Category */}
            {product.category && (
              <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
            )}

            {/* Ratings */}
            {product.averageRating !== undefined && renderStars()}

            <p className="text-lg font-bold text-gray-900 mt-2">${product.price}</p>
          </div>

          <Button
            className="w-full mt-3 bg-black hover:bg-gray-800 text-white text-sm py-2 flex items-center justify-center"
            size="sm"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
