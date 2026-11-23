
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Transaction = {
  _id: string;
  appointmentId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentProvider: "demo" | "stripe";
  transactionReference: string;
  status: "paid" | "failed";
  createdAt: string;
};

export default function TransactionsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (isPending || loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-sm text-stone-500">Loading transactions...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          View payment records and transaction details.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Demo payment mode
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Payments currently shown here are simulated. No real money
          has been charged. Stripe payments are not configured yet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Total Transactions</p>
          <p className="mt-2 text-2xl font-bold text-stone-900">
            {transactions.length}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Successful Records</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {transactions.filter((item) => item.status === "paid").length}
          </p>
        </div>
      </div>

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

      {!error && transactions.length === 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <h2 className="font-semibold text-stone-800">
            No transactions yet
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Completed payment records will appear here.
          </p>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-100 p-5">
            <h2 className="font-semibold text-stone-900">
              All Transactions
            </h2>
            <button
              onClick={loadTransactions}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Appointment ID</th>
                  <th className="px-5 py-4">Customer ID</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 font-medium text-stone-800">
                      <span className="block max-w-40 truncate">
                        {transaction.transactionReference}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      <span className="block max-w-32 truncate">
                        {transaction.appointmentId}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      <span className="block max-w-32 truncate">
                        {transaction.customerId}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-stone-900">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {transaction.paymentProvider === "demo"
                          ? "Demo"
                          : "Stripe"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
