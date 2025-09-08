"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Pencil } from "lucide-react";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [inStockOnly, setInStockOnly] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // fetch categories
  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data?.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  // fetch products
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/products", {
        params: {
          page,
          limit,
          search,
          status,
          categoryId,
          sortBy,
          order,
          inStock: inStockOnly || undefined,
          include: "category,images",
        },
      })
      .then((res) => {
        setProducts(res.data?.data ?? []);
        setTotalPages(res.data?.meta?.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, limit, search, status, categoryId, sortBy, order, inStockOnly]);

  // handle status change
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      await axios.patch(`/api/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 text-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild className="flex items-center gap-2 shadow">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> New Product
          </Link>
        </Button>
      </div>

      {/* Metadata */}
      <Card className="shadow bg-white">
        <CardContent className="p-4 flex flex-wrap gap-6 text-sm text-gray-900">
          <div>
            <span className="font-medium">Total Products:</span>{" "}
            {products.length}
          </div>
          <div>
            <span className="font-medium">Categories:</span> {categories.length}
          </div>
          <div>
            <span className="font-medium">Current Page:</span> {page} /{" "}
            {totalPages}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow bg-white">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center text-gray-900">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            onValueChange={(val) =>
              setCategoryId(val === "all" ? undefined : val)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800">
              <SelectItem value="all">All Categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800">
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              <SelectItem value="DELETED">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSortBy} defaultValue="createdAt">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800">
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="createdAt">Created At</SelectItem>
              <SelectItem value="updatedAt">Updated At</SelectItem>
              <SelectItem value="averageRating">Avg Rating</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              checked={inStockOnly}
              onCheckedChange={setInStockOnly}
              className="bg-zinc-600"
            />
            <span className="text-sm text-gray-600">In Stock Only</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <Card className="p-10 text-center text-gray-500 shadow bg-white">
          Loading products...
        </Card>
      ) : products.length > 0 ? (
        <Card className="shadow bg-white">
          <CardContent className="p-0 text-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="bg-black">
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Avg Rating</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/products/${p.id}`)}
                  >
                    <TableCell>
                      <img
                        src={
                          p.images?.[0]?.url ?? "https://via.placeholder.com/40"
                        }
                        alt={p.name}
                        className="h-10 w-10 rounded-md object-cover border"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-blue-600 hover:underline">
                      {p.name}
                    </TableCell>
                    <TableCell>{p.category?.name ?? "-"}</TableCell>
                    <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={p.status}
                        onValueChange={(val) => updateStatus(p.id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800">
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="DISCONTINUED">
                            Discontinued
                          </SelectItem>
                          <SelectItem value="DELETED">Deleted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>⭐ {p.averageRating ?? "-"}</TableCell>
                    <TableCell>
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <div className="p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center p-10 text-center gap-4 shadow bg-white text-gray-900">
          <div className="text-gray-500">No products found.</div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" /> Add New Product
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
