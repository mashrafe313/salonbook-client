
"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/lib/api";

interface DashboardStats {
  totalCustomers?: number;
  activeServices?: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  successfulPayments?: number;
}

interface DashboardStatsProps {
  role: "admin" | "customer";
}

export default function DashboardStats({ role }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        role === "admin"
          ? "/api/dashboard/admin"
          : "/api/dashboard/customer";

      const result = await authenticatedApiFetch(endpoint);

      setStats(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const cards =
    role === "admin"
      ? [
          {
            label: "Total Customers",
            value: stats?.totalCustomers,
            color: "text-blue-600",
          },
          {
            label: "Active Services",
            value: stats?.activeServices,
            color: "text-green-600",
          },
          {
            label: "Total Appointments",
            value: stats?.totalAppointments,
            color: "text-purple-600",
          },
          {
            label: "Pending Appointments",
            value: stats?.pendingAppointments,
            color: "text-amber-600",
          },
          {
            label: "Confirmed Appointments",
            value: stats?.confirmedAppointments,
            color: "text-green-600",
          },
          {
            label: "Cancelled Appointments",
            value: stats?.cancelledAppointments,
            color: "text-red-600",
          },
          {
            label: "Successful Payments",
            value: stats?.successfulPayments,
            color: "text-emerald-600",
          },
        ]
      : [
          {
            label: "Total Appointments",
            value: stats?.totalAppointments,
            color: "text-blue-600",
          },
          {
            label: "Pending Appointments",
            value: stats?.pendingAppointments,
            color: "text-amber-600",
          },
          {
            label: "Confirmed Appointments",
            value: stats?.confirmedAppointments,
            color: "text-green-600",
          },
          {
            label: "Cancelled Appointments",
            value: stats?.cancelledAppointments,
            color: "text-red-600",
          },
        ];

  return (
    <div className="mt-8">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="animate-pulse rounded-xl border border-stone-200 bg-stone-50 p-5"
            >
              <div className="h-4 w-32 rounded bg-stone-200" />
              <div className="mt-4 h-8 w-16 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => void loadStats()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-stone-200 bg-stone-50 p-5 transition hover:shadow-sm"
            >
              <p className="text-sm font-medium text-stone-600">
                {card.label}
              </p>

              <p className={`mt-3 text-3xl font-bold ${card.color}`}>
                {card.value ?? 0}
              </p>

              <p className="mt-1 text-xs text-stone-400">
                Live data from your database
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
