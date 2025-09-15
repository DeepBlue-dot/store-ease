"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react"
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
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [liked, setLiked] = useState(product.liked || false)
  const [qtyInCart, setQtyInCart] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const productImage = product.images?.[currentImageIndex]?.url || "/placeholder.svg?height=256&width=256&query=tech product"

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("/api/cart")
        const item = res.data.items.find((i: any) => i.product.id === product.id)
        if (item) setQtyInCart(item.qty)
      } catch (err: any) {
        console.warn("User not logged in or cart empty")
      }
    }
    fetchCart()
  }, [product.id])

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error("Out of stock!")
      return
    }

    setAdding(true)
    try {
      await axios.post("/api/cart", { productId: product.id, qty: 1 })
      setQtyInCart(prev => prev + 1)
      toast.success(`${product.name} added to cart!`)
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please login to add products to cart.")
      } else {
        toast.error("Failed to add to cart.")
      }
    } finally {
      setAdding(false)
    }
  }

  const toggleLike = () => setLiked(!liked)

  const renderStars = () => {
    const fullStars = Math.floor(product.averageRating || 0)
    const halfStar = (product.averageRating || 0) - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    return (
      <div className="flex items-center gap-1">
        {Array(fullStars).fill(0).map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400" />)}
        {halfStar && <Star className="h-4 w-4 text-yellow-200" />}
        {Array(emptyStars).fill(0).map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)}
        {product.ratingsCount !== undefined && <span className="text-xs text-gray-500 ml-1">({product.ratingsCount})</span>}
      </div>
    )
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.images) return
    setCurrentImageIndex((prev) => (prev + 1) % product.images!.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.images) return
    setCurrentImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length)
  }

  return (
    <Card
      className="group hover:shadow-lg transition-shadow duration-300 bg-white rounded-lg overflow-hidden cursor-pointer"
      onClick={() => router.push(`/shop/${product.id}`)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={productImage}
            alt={product.name}
            width={400}
            height={256}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />

          {product.images && product.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            onClick={(e) => { e.stopPropagation(); toggleLike() }}
          >
            <Heart className={`h-5 w-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
          </Button>

          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</div>
          )}
          {product.stock && product.stock > 0 && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded">In Stock</div>
          )}
        </div>

        <div className="p-4 flex flex-col justify-between h-56">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
            {product.category && <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>}
            {product.averageRating !== undefined && renderStars()}
            <p className="text-lg font-bold text-gray-900 mt-2">${product.price}</p>
          </div>

          <Button
            className="w-full mt-3 bg-black hover:bg-gray-800 text-white text-sm py-2 flex items-center justify-center"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleAddToCart() }}
            disabled={adding || product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {qtyInCart > 0 ? `In Cart (${qtyInCart})` : adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
