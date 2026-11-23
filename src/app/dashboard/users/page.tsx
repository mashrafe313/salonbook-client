
"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface Customer {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  image: string | null;
  createdAt: string | null;
}

export default function ManageUsersPage() {
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = session?.user as
    | { role?: string; name?: string; email?: string }
    | undefined;

  const loadUsers = useCallback(async (searchTerm = "") => {
    try {
      setLoading(true);
      setError("");

      const query = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : "";

      const result = await authenticatedApiFetch(
        `/api/users${query}`
      );

      setUsers(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load customers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && user?.role === "admin") {
      void loadUsers();
    }
  }, [isPending, user?.role, loadUsers]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadUsers(search.trim());
  }

  async function toggleBlock(customer: Customer) {
    const action = customer.isBlocked ? "unblock" : "block";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      setActionId(customer._id);
      setError("");
      setMessage("");

      await authenticatedApiFetch(
        `/api/users/${customer._id}/${action}`,
        { method: "PATCH" }
      );

      setMessage(
        `${customer.name} has been ${action === "block" ? "blocked" : "unblocked"} successfully.`
      );

      await loadUsers(search.trim());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Could not ${action} customer.`
      );
    } finally {
      setActionId(null);
    }
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!session || user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Access denied
          </h1>
          <p className="mt-2 text-gray-600">
            Only administrators can manage customers.
          </p>
        </div>
      </main>
    );
  }

  const blockedCount = users.filter((item) => item.isBlocked).length;

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <DashboardSidebar role="admin" />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose-600">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Manage Users
            </h1>
            <p className="mt-2 text-gray-600">
              View customer accounts and manage their access.
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total customers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {users.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Blocked customers</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {blockedCount}
              </p>
            </div>
          </div>

          {message && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Customer accounts
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Search by customer name or email.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex w-full gap-2 sm:max-w-md"
              >
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers..."
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
                >
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">
                Loading customers...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-semibold text-gray-700">
                  No customers found
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Try another search term.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Joined</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {customer.image ? (
                              <img
                                src={customer.image}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 font-bold text-rose-700">
                                {customer.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                            )}

                            <span className="font-semibold text-gray-900">
                              {customer.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {customer.email}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              customer.isBlocked
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {customer.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => void toggleBlock(customer)}
                            disabled={actionId === customer._id}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              customer.isBlocked
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {actionId === customer._id
                              ? "Please wait..."
                              : customer.isBlocked
                                ? "Unblock"
                                : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
