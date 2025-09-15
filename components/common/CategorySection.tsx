"use client"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
  imageUrl?: string | null
  _count?: { products: number }
}

export function CategorySection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories", {
          params: { page: 1, limit: 20, sortBy: "createdAt", order: "desc" },
        })
        if (res.data.success) {
          setCategories(res.data.data)
        }
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth / 2
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  // Redirect when a category is clicked
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/shop?categoryId=${categoryId}`)
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Browse By Category</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-transparent"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous categories</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-transparent"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next categories</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide"
          >
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex-shrink-0 flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group w-40"
              >
                <div className="mb-4 p-4 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="object-contain h-12 w-12"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                      No Img
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">{category.name}</span>
                {category._count?.products !== undefined && (
                  <span className="text-xs text-gray-500">{category._count.products} products</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
