import { getUsers } from "@/lib/mock-data";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-black">
          Customers
        </h2>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-black">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "N/A"}</td>
                  <td>
                    <span
                      className={`badge badge-${
                        user.status === "ACTIVE" ? "success" : "secondary"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline">
                      {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
