import { getDashboardData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      title: "Total Orders",
      value: data.totalOrders,
      description: "All time orders",
    },
    {
      title: "Pending Orders",
      value: data.pendingOrders,
      description: "Require attention",
    },
    {
      title: "Total Products",
      value: data.totalProducts,
      description: "In inventory",
    },
    {
      title: "Low Stock",
      value: data.lowStockProducts,
      description: "Products needing restock",
    },
    {
      title: "Customers",
      value: data.totalUsers,
      description: "Registered users",
    },
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-black">
          Dashboard
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-black font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-black font-bold">{stat.value}</div>
              <p className="text-xs text-black">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* We can add charts and recent orders here later */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-black">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-black">
              Recent orders chart will go here
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-black">Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-black">
              Stock levels chart will go here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
