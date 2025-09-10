"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------
// Zod Schema
// ---------------------
const filterSchema = z.object({
  status: z.enum(["ALL", "PENDING", "COMPLETED", "CANCELED", "FAILED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "totalPrice", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

// ---------------------
// Fetch Orders
// ---------------------
const fetchOrders = async (filters: FilterForm & { page: number; limit: number }) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  const { data } = await axios.get(`/api/orders?${params.toString()}`);
  return data;
};

// ---------------------
// Component
// ---------------------
export default function AdminOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [ordersData, setOrdersData] = useState<any>({ orders: [], totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      sortBy: "createdAt",
      sortOrder: "desc",
      search: "",
      status: "ALL",
    },
  });

  const filters = watch();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders({ ...filters, page, limit });
      setOrdersData(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSubmit = () => {
    setPage(1);
    loadOrders();
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      loadOrders(); // refresh table
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-900";
      case "COMPLETED":
        return "bg-green-100 text-green-900";
      case "CANCELED":
        return "bg-red-100 text-red-900";
      case "FAILED":
        return "bg-gray-200 text-gray-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Admin Orders</h1>

      {/* Filters Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap gap-4 mb-6 items-end"
      >
        <Controller
          name="search"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="Search by User / Order ID"
              className="w-64 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md text-gray-900"
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select {...field} value={field.value ?? "ALL"}>
              <SelectTrigger className="w-48 text-gray-900">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CANCELED">CANCELED</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <Input
              type="date"
              {...field}
              value={field.value ?? ""}
              className="w-48 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md text-gray-900"
            />
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <Input
              type="date"
              {...field}
              value={field.value ?? ""}
              className="w-48 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md text-gray-900"
            />
          )}
        />

        <Controller
          name="sortBy"
          control={control}
          render={({ field }) => (
            <Select {...field} value={field.value ?? "createdAt"}>
              <SelectTrigger className="w-48 text-gray-900">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="totalPrice">Total</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          name="sortOrder"
          control={control}
          render={({ field }) => (
            <Select {...field} value={field.value ?? "desc"}>
              <SelectTrigger className="w-32 text-gray-900">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2">
          Apply
        </Button>
      </form>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {isLoading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : (
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersData.orders.map((order: any) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user.name || order.user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger
                        className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                        <SelectItem value="CANCELED">CANCELED</SelectItem>
                        <SelectItem value="FAILED">FAILED</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>${order.totalPrice}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 mb-1">
                        {item.product.images?.[0]?.url && (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <span>
                          {item.product.name} x {item.qty}
                        </span>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4 items-center">
        <Button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md px-4 py-2"
        >
          Previous
        </Button>
        <span className="text-gray-700">
          Page {page} of {ordersData.totalPages || 1}
        </span>
        <Button
          disabled={page === ordersData.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md px-4 py-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
