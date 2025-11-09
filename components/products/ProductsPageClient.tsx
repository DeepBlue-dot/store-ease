"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  Grid3X3,
  List,
  Search,
  Filter,
  Star,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductListItem } from "@/components/products/ProductListItem";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category: { id: string; name: string; imageUrl: string };
  images: Array<{ id: string; url: string; createdAt: string }>;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    sortBy: string;
    order: string;
  };
}

export default function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("categoryId") || "all"
  );
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ProductsResponse["meta"] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
          sortBy,
          order: sortOrder,
        });

        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory !== "all")
          params.append("categoryId", selectedCategory);
        if (priceRange[0] > 0)
          params.append("minPrice", priceRange[0].toString());
        if (priceRange[1] < 2000)
          params.append("maxPrice", priceRange[1].toString());
        if (inStockOnly) params.append("inStock", "true");

        const response = await axios.get<ProductsResponse>(
          `/api/products?${params}`
        );
        setProducts(response.data.data);
        setMeta(response.data.meta);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    selectedCategory,
    searchQuery,
    inStockOnly,
    priceRange,
  ]);

  // Redirect helper
  const redirectWithQuery = (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== "all")
      params.append("categoryId", categoryId);
    if (search) params.append("search", search);
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    redirectWithQuery(selectedCategory, searchQuery);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    redirectWithQuery(categoryId, searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    setCurrentPage(1);
    router.push("/shop");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Products</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of premium tech products
          </p>
        </div>

        {/* Category Buttons for quick redirect */}
        <div className="flex gap-4 flex-wrap mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>

          {/* Filters UI (Category, Price, Sort, Stock) */}
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 bg-white rounded-lg border",
              showFilters ? "block" : "hidden lg:grid"
            )}
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={2000}
                step={50}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="averageRating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Order</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="inStock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) =>
                    setInStockOnly(checked === true)
                  }
                />
                <label htmlFor="inStock" className="text-sm">
                  In Stock Only
                </label>
              </div>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* View Toggle and Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {meta ? `${meta.total} products found` : "Loading..."}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No products found</p>
            <Button onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from(
                  { length: Math.min(5, meta.totalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(meta.totalPages - 4, currentPage - 2)
                      ) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(meta.totalPages, currentPage + 1))
                  }
                  disabled={currentPage === meta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
