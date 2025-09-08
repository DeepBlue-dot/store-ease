"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  image: z.any().optional(), // file input
});
type CategoryForm = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // dialog + edit state
  const [openDialog, setOpenDialog] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // table/query state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 🔧 Proper sorting state to match API
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name">(
    "createdAt"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  const watchImage = watch("image");
  useEffect(() => {
    if (watchImage && watchImage[0]) {
      const file = watchImage[0] as File;
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchImage]);

  // fetch list with server-side search/sort/pagination
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories", {
        params: {
          search: search || undefined,
          page,
          limit,
          sortBy, // ✅ correct param
          order, // ✅ correct param
          select: "id,name,imageUrl,createdAt,updatedAt,_count", // optional, trims payload
        },
      });
      setCategories(res.data.data ?? []);
      setTotalPages(res.data?.meta?.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, sortBy, order]);

  // create or update
  const onSubmit = async (data: CategoryForm) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.image?.[0]) formData.append("image", data.image[0]);

      if (editCategory) {
        await axios.patch(`/api/categories/${editCategory.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`/api/categories`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      handleDialogClose();
      fetchCategories();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  // delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      // optimistic update
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  // helpers
  const handleDialogOpenForCreate = () => {
    setEditCategory(null);
    reset({ name: "", image: undefined as any });
    setImagePreview(null);
    setOpenDialog(true);
  };

  const handleDialogOpenForEdit = (cat: Category) => {
    setEditCategory(cat);
    reset({ name: cat.name, image: undefined as any });
    setImagePreview(cat.imageUrl ?? null);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditCategory(null);
    reset({ name: "", image: undefined as any });
    setImagePreview(null);
  };

  const toggleOrder = () => setOrder((o) => (o === "asc" ? "desc" : "asc"));
  const sortIconLabel = useMemo(
    () => (order === "asc" ? "Asc" : "Desc"),
    [order]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-black text-white p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            🛠 Manage Categories
          </h1>

          <Dialog
            open={openDialog}
            onOpenChange={(o) =>
              o ? handleDialogOpenForCreate() : handleDialogClose()
            }
          >
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow">
                Create Category
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-gray-900 border border-gray-700 text-white sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editCategory ? "Edit Category" : "Create Category"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                    placeholder="Category name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="bg-gray-800 border-gray-700 text-white rounded-xl"
                    {...register("image")}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 mt-2 object-cover rounded-xl border border-gray-700"
                    />
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl"
                  >
                    {loading ? "Saving..." : editCategory ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/70 border border-gray-700 shadow-lg rounded-2xl">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 rounded-xl"
              />
            </div>

            <div>
              <Label className="mb-1 block text-gray-300">Sort by</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created date</SelectItem>
                  <SelectItem value="updatedAt">Updated date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block text-gray-300">Order</Label>
              <Select value={order} onValueChange={(v) => setOrder(v as any)}>
                <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc (Z→A / Newest)</SelectItem>
                  <SelectItem value="asc">Asc (A→Z / Oldest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-gray-800/70 border border-gray-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">
                    <button
                      className="inline-flex items-center gap-1 hover:text-white"
                      onClick={() => {
                        setSortBy("name");
                        toggleOrder();
                      }}
                    >
                      Name <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-300">Image</TableHead>
                  <TableHead className="text-gray-300">Products</TableHead>
                  <TableHead className="text-gray-300">
                    <button
                      className="inline-flex items-center gap-1 hover:text-white"
                      onClick={() => {
                        setSortBy("createdAt");
                        toggleOrder();
                      }}
                    >
                      Created <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <button
                      className="inline-flex items-center gap-1 hover:text-white"
                      onClick={() => {
                        setSortBy("updatedAt");
                        toggleOrder();
                      }}
                    >
                      Updated <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="border-gray-700 hover:bg-gray-700/40 transition"
                  >
                    <TableCell className="font-medium text-white">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-700"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {category._count?.products ?? 0}
                    </TableCell>
                    <TableCell
                      className="text-gray-400"
                      title={new Date(category.createdAt).toLocaleString()}
                    >
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className="text-gray-400"
                      title={new Date(category.updatedAt).toLocaleString()}
                    >
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        onClick={() => handleDialogOpenForEdit(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-400 py-6"
                    >
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl"
          >
            Prev
          </Button>
          <span className="text-gray-300">
            Page <span className="text-white">{page}</span> / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
