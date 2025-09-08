"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, Ban, CheckCircle, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner"; // ✅ Sonner

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  image?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users", {
        params: {
          page,
          limit: 15,
          search,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          sortBy,
          order,
        },
      });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter, sortBy, order]);

  const updateStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    try {
      await axios.patch(`/api/users/${id}`, { status });
      toast.success("User updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const bulkUpdate = async (status: "ACTIVE" | "INACTIVE") => {
    try {
      await Promise.all(
        selectedIds.map((id) => axios.patch(`/api/users/${id}`, { status }))
      );
      toast.success(`Updated ${selectedIds.length} users`);
      setSelectedIds([]);
      fetchUsers();
    } catch {
      toast.error("Bulk update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="container mx-auto max-w-6xl space-y-6">
        <Card className="shadow-md border border-gray-200 rounded-2xl bg-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Manage Users
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Select onValueChange={(val) => setRoleFilter(val)}>
                  <SelectTrigger className="w-[140px] rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger className="w-[140px] rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex justify-between items-center mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  {selectedIds.length} users selected
                </p>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    onClick={() => bulkUpdate("ACTIVE")}
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-lg"
                    onClick={() => bulkUpdate("INACTIVE")}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead>
                      <Checkbox
                        checked={
                          selectedIds.length === users.length &&
                          users.length > 0
                        }
                        onCheckedChange={(checked) =>
                          setSelectedIds(checked ? users.map((u) => u.id) : [])
                        }
                      />
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("name")}
                      className="cursor-pointer font-semibold text-gray-800"
                    >
                      Name <ArrowUpDown size={14} className="inline ml-1" />
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("email")}
                      className="cursor-pointer font-semibold text-gray-800"
                    >
                      Email <ArrowUpDown size={14} className="inline ml-1" />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800">
                      Status
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("createdAt")}
                      className="cursor-pointer font-semibold text-gray-800"
                    >
                      Created <ArrowUpDown size={14} className="inline ml-1" />
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-800">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => (
                    <TableRow
                      key={user.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition border-b border-gray-200`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(user.id)}
                          onCheckedChange={() => toggleSelect(user.id)}
                        />
                      </TableCell>
                      <TableCell className="flex items-center gap-2 font-medium text-gray-900">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={28}
                            height={28}
                            className="rounded-full border border-gray-300 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                        )}
                        {user.name || "—"}
                      </TableCell>

                      <TableCell className="text-gray-700">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-md border-gray-300 text-gray-800"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.status === "ACTIVE" ? (
                          <Badge className="bg-green-600 text-white rounded-md">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600 text-white rounded-md">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={16} />
                        </Button>
                        {user.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() => updateStatus(user.id, "INACTIVE")}
                          >
                            <Ban size={16} />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            onClick={() => updateStatus(user.id, "ACTIVE")}
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {meta && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Page {meta.page} of {meta.totalPages} ({meta.total} users)
                </p>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="max-w-md rounded-2xl bg-white border border-gray-200">
            {selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    User Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 p-2 text-gray-700">
                  <p>
                    <span className="font-medium text-gray-900">Name:</span>{" "}
                    {selectedUser.name}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Email:</span>{" "}
                    {selectedUser.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Role:</span>{" "}
                    {selectedUser.role}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Status:</span>{" "}
                    {selectedUser.status}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Created:</span>{" "}
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
