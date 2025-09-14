"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { ProductCard } from "./ProductCard"

type Product = {
  id: string
  name: string
  price: number
  liked?: boolean
  images?: { id: string; url: string }[]
}

const tabs = ["New Arrival", "Bestseller", "Featured Products"]

export function ProductGrid() {
  const [activeTab, setActiveTab] = useState("New Arrival")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      let params: Record<string, any> = {
        page: 1,
        limit: 8,
        include: "images,category",
      }

      if (activeTab === "New Arrival") {
        params.sortBy = "createdAt"
        params.order = "desc"
      } else if (activeTab === "Bestseller") {
        params.sortBy = "stock"
        params.order = "asc"
      } else if (activeTab === "Featured Products") {
        params.sortBy = "averageRating"
        params.order = "desc"
      }

      try {
        const res = await axios.get("/api/products", { params })
        setProducts(res.data.data || [])
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [activeTab])

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-12">
          <div className="flex justify-start border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        {loading ? (
          <p className="text-gray-500">Loading {activeTab}...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
