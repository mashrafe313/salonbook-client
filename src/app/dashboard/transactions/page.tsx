
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Transaction = {
  _id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  serviceName: string;
  appointmentDate: string | null;
  timeSlot: string | null;
  amount: number;
  currency: string;
  paymentProvider: "demo" | "stripe";
  transactionReference: string;
  stripeSessionId?: string;
  status: "paid" | "failed";
  createdAt: string;
};

type FilterType = "all" | "paid" | "failed";

export default function TransactionsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await authenticatedApiFetch("/api/transactions");
      setTransactions(result?.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (session.user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    loadTransactions();
  }, [isPending, session, router, loadTransactions]);

  const stats = useMemo(() => ({
    total: transactions.length,
    successful: transactions.filter(
      (item) => item.status === "paid"
    ).length,
    failed: transactions.filter(
      (item) => item.status === "failed"
    ).length,
  }), [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;

    return transactions.filter(
      (item) => item.status === filter
    );
  }, [transactions, filter]);

  function formatAmount(amount: number, currency: string) {
    try {
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency || "BDT"} ${amount.toFixed(2)}`;
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (isPending || loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
        <p className="mt-3 text-sm text-stone-500">
          Loading transactions...
        </p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-rose-600">
            Payment Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Monitor payment records and transaction activity.
          </p>
        </div>

        <button
          onClick={loadTransactions}
          className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          ↻ Refresh
        </button>
      </div>

      


      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Transactions
            </p>
            <span className="rounded-xl bg-rose-50 p-3 text-rose-600">
              ◫
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-stone-900">
            {stats.total}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            All recorded payment transactions
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Successful Payments
            </p>
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              ✓
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-stone-900">
            {stats.successful}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Transactions recorded as paid
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Failed Payments
            </p>
            <span className="rounded-xl bg-red-50 p-3 text-red-600">
              !
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-stone-900">
            {stats.failed}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Transactions recorded as failed
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadTransactions}
            className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Transactions table */}
      {!error && (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                All Transactions
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {filteredTransactions.length} transaction(s) displayed
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "paid", "failed"] as FilterType[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                    filter === item
                      ? "bg-rose-600 text-white"
                      : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {item === "paid" ? "Successful" : item === "all" ? "All" : "Failed"}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-stone-800">
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions found"}
              </p>
              <p className="mt-2 text-sm text-stone-500">
                {transactions.length === 0
                  ? "Completed payment records will appear here."
                  : "Try selecting a different filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Payment Reference</th>
                    <th className="px-5 py-4">Provider</th>
                    <th className="px-5 py-4">Recorded</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="transition hover:bg-stone-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">
                          {transaction.serviceName}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDate(transaction.appointmentDate)}
                          {transaction.timeSlot
                            ? ` · ${transaction.timeSlot}`
                            : ""}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-bold text-stone-900">
                          {formatAmount(
                            transaction.amount,
                            transaction.currency
                          )}
                        </p>
                        <p className="mt-1 text-xs uppercase text-stone-500">
                          {transaction.currency}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.status === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span className="mr-1">●</span>
                          {transaction.status === "paid" ? "Paid" : "Failed"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="block max-w-48 truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600"
                          title={
                            transaction.paymentProvider === "stripe"
                              ? transaction.stripeSessionId || transaction.transactionReference
                              : transaction.transactionReference
                          }
                        >
                          {transaction.paymentProvider === "stripe"
                            ? transaction.stripeSessionId || transaction.transactionReference
                            : transaction.transactionReference}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.paymentProvider === "demo"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {transaction.paymentProvider === "demo"
                            ? "Demo"
                            : "Stripe"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                        {formatDateTime(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
