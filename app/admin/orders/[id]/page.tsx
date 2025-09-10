"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      fetchOrder();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !order) return <p className="text-white">Loading...</p>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      {/* Order Info */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md">
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p className="mt-2">
          <strong>Status:</strong>{" "}
          <Select
            value={order.status}
            onValueChange={(val) => handleStatusChange(val)}
          >
            <SelectTrigger className="w-40 bg-gray-700 text-white border border-gray-600">
              <SelectValue placeholder={order.status} />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white">
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
              <SelectItem value="CANCELED">CANCELED</SelectItem>
              <SelectItem value="FAILED">FAILED</SelectItem>
            </SelectContent>
          </Select>
        </p>
        <p className="mt-2">
          <strong>Total:</strong> ${order.totalPrice}
        </p>
        <p className="mt-2">
          <strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3">User Info</h2>
        <p>
          <strong>Name:</strong> {order.user.name}
        </p>
        <p>
          <strong>Email:</strong> {order.user.email}
        </p>
        {order.user.phone && <p><strong>Phone:</strong> {order.user.phone}</p>}
        {order.user.address && <p><strong>Address:</strong> {order.user.address}</p>}
      </div>

      {/* Items */}
      <div className="p-4 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3">Items</h2>
        <Table className="bg-gray-700 text-white rounded-lg overflow-hidden">
          <TableHeader className="bg-gray-600">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item: any) => (
              <TableRow key={item.id} className="hover:bg-gray-600 cursor-pointer">
                <TableCell
                  className="flex items-center gap-2 text-blue-400 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`http://localhost:3000/admin/products/${item.product.id}`);
                  }}
                >
                  {item.product.images?.[0]?.url && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-8 h-8 rounded"
                    />
                  )}
                  {item.product.name}
                </TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>${item.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
