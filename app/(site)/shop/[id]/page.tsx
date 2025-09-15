"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ProductCard } from "@/components/products/ProductCard"

interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  price: number
  stock: number
  status?: string
  createdAt: string
  updatedAt: string
  averageRating?: number
  ratingsCount?: number
  category?: { id: string; name: string }
  images?: { id: string; url: string }[]
}

interface Review {
  id: string
  rating: number
  review?: string
  user: { name: string }
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cartQty, setCartQty] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  // Rating submission state
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Product
        const productRes = await axios.get(`/api/products/${params.id}?include=images,category`)
        const prodData: Product = { ...productRes.data, images: productRes.data.images || [] }
        setProduct(prodData)

        // Reviews
        const reviewsRes = await axios.get(`/api/ratings/${params.id}?page=1&limit=10`)
        setReviews(reviewsRes.data.data)
        if (reviewsRes.data.meta?.averageRating) prodData.averageRating = reviewsRes.data.meta.averageRating

        // Related products
        if (prodData.category?.id) {
          const relatedRes = await axios.get(
            `/api/products?limit=4&include=images,category&categoryId=${prodData.category.id}`
          )
          setRelatedProducts(Array.isArray(relatedRes.data.data) ? relatedRes.data.data : [])
        }

        // Cart (only if user logged in)
        try {
          const cartRes = await axios.get("/api/cart")
          const item = cartRes.data.items.find((i: any) => i.product.id === prodData.id)
          if (item) setCartQty(item.qty)
        } catch (err) {
          console.warn("User not logged in, skipping cart fetch")
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return toast.error("Out of stock!")

    const newQty = cartQty + quantity
    if (newQty > product.stock) return toast.error("Cannot add more than available stock!")

    setAddingToCart(true)
    setCartQty(newQty) // Optimistic UI

    try {
      await axios.post("/api/cart", { productId: product.id, qty: quantity })
      toast.success(`${product.name} added to cart!`)
    } catch (err: any) {
      setCartQty(cartQty) // rollback
      if (err.response?.status === 401) toast.error("Please login to add products to cart.")
      else toast.error(err.response?.data?.message || "Failed to add to cart.")
    } finally {
      setAddingToCart(false)
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  const nextImage = () =>
    setCurrentImageIndex((prev) => (product?.images?.length ? (prev + 1) % product.images.length : 0))
  const prevImage = () =>
    setCurrentImageIndex((prev) => (product?.images?.length ? (prev - 1 + product.images.length) % product.images.length : 0))

  const renderStars = (rating: number = 0, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const ratingHistogram = () => {
    const counts = [0, 0, 0, 0, 0]
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++
    })
    return counts
  }

  const handleSubmitReview = async () => {
    if (!product) return
    if (userRating < 1 || userRating > 5) return toast.error("Please select a rating")
    setSubmittingReview(true)
    try {
      await axios.post(`/api/ratings/${product.id}`, {
        rating: userRating,
        review: userReview,
      })
      toast.success("Review submitted!")
      const reviewsRes = await axios.get(`/api/ratings/${product.id}?page=1&limit=10`)
      setReviews(reviewsRes.data.data)
      setUserRating(0)
      setUserReview("")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Button onClick={() => router.push("/shop")}>Back to Shop</Button>
        </div>
      </div>
    )

  const images = product.images || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-900">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${product.category.id}`} className="hover:text-gray-900">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left - Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={images[currentImageIndex]?.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain p-8"
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setCurrentImageIndex(i)}
                  className={`flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 ${i === currentImageIndex ? "border-blue-500" : "border-gray-200"}`}>
                  <Image src={img.url || "/placeholder.svg"} alt={`${product.name} ${i + 1}`} width={80} height={80} className="object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-3">
              {renderStars(product.averageRating || 0)}
              <span className="text-sm text-gray-600">{product.averageRating?.toFixed(1) || 0} ({reviews.length} reviews)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.status && <Badge variant={product.status === "ACTIVE" ? "default" : "destructive"}>{product.status}</Badge>}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </Badge>
            </div>

            <p className="text-gray-600 text-lg">{product.shortDescription}</p>

            <div className="text-sm text-gray-500">
              <p>ID: {product.id}</p>
              <p>Created At: {new Date(product.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</Button>
              <input type="number" value={quantity} min={1} max={product.stock} onChange={e => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))} className="w-16 text-center border rounded" />
              <Button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>+</Button>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? "Out of Stock" : cartQty > 0 ? `In Cart (${cartQty})` : addingToCart ? "Adding..." : "Add to Cart"}
              </Button>

              <Button variant="outline" onClick={toggleWishlist}>
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-16">
          <h2 className="text-2xl font-bold mb-4">Ratings & Reviews</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold">{product.averageRating?.toFixed(1) || 0}</span>
              <div>{renderStars(Math.round(product.averageRating || 0), "md")}</div>
              <span className="text-sm text-gray-500">{reviews.length} ratings</span>
            </div>

            <div className="flex-1">
              {ratingHistogram().reverse().map((count, idx) => {
                const star = 5 - idx
                const percent = reviews.length ? (count / reviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="w-6 text-sm">{star}★</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded overflow-hidden">
                      <div className="h-3 bg-yellow-400" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="w-8 text-sm text-gray-500">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Submit Rating */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-2">Leave a Review</h3>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  onClick={() => setUserRating(star)}
                />
              ))}
            </div>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full border rounded p-2 mb-2"
            />
            <Button onClick={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <p className="text-gray-700">{product.description || "No description available."}</p>
          </TabsContent>

          <TabsContent value="images" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.length ? images.map(img => (
                <div key={img.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={img.url} alt={product.name} width={300} height={300} className="object-contain" />
                </div>
              )) : <p>No images available.</p>}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            {reviews.length === 0 ? <p>No reviews yet.</p> :
              <div className="space-y-6">
                {reviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating, "sm")}
                          <span className="font-medium">{review.user.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600">{review.review}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
