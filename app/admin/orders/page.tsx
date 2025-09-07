import { getOrders } from "@/lib/mock-data";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-black">Orders</h2>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-black">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono">{order.id.slice(0, 8)}...</td>
                  <td>{order.user.name}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalPrice}</td>
                  <td>
                    <span
                      className={`badge badge-${
                        order.status === "COMPLETED"
                          ? "success"
                          : order.status === "PENDING"
                          ? "warning"
                          : "secondary"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
