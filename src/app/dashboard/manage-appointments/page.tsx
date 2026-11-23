
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

interface Appointment {
  _id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  servicePrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  message?: string;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    unpaid: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || "bg-stone-100 text-stone-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function ManageAppointmentsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const user = session?.user as { role?: string } | undefined;

  const loadAppointments = useCallback(async () => {
    try {
      setError("");

      const result = await authenticatedApiFetch("/api/appointments");

      const records = Array.isArray(result?.data)
        ? result.data
        : [];

      setAppointments(records as Appointment[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load appointments."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    void loadAppointments();
  }, [isPending, session, user?.role, router, loadAppointments]);

  async function updateStatus(
    appointmentId: string,
    status: "confirmed" | "cancelled"
  ) {
    setUpdatingId(appointmentId);
    setFeedback("");
    setError("");

    try {
      await authenticatedApiFetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      setFeedback(
        `Appointment ${status} successfully.`
      );

      await loadAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (isPending || isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-stone-50">
        <p className="text-stone-600">Loading appointments...</p>
      </main>
    );
  }

  if (!session || user?.role !== "admin") {
    return null;
  }

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  ).length;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            Manage Appointments
          </h1>

          <p className="mt-2 text-stone-600">
            Review and manage customer appointment requests.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Confirmed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {confirmedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Cancelled</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {cancelledCount}
            </p>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700"
          >
            {feedback}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {appointments.length === 0 && !error ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-4xl">📅</div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">
              No appointments found
            </h2>
            <p className="mt-2 text-stone-600">
              Customer appointment requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-stone-900">
                      {appointment.serviceName}
                    </h2>

                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      <p>
                        <strong className="text-stone-800">
                          Customer:
                        </strong>{" "}
                        {appointment.customerName}
                      </p>

                      <p className="break-all">
                        <strong className="text-stone-800">
                          Email:
                        </strong>{" "}
                        {appointment.customerEmail}
                      </p>

                      <p>
                        <strong className="text-stone-800">
                          Date:
                        </strong>{" "}
                        {formatDate(appointment.appointmentDate)}
                      </p>

                      <p>
                        <strong className="text-stone-800">
                          Time:
                        </strong>{" "}
                        {formatTime(appointment.timeSlot)}
                      </p>

                      <p>
                        <strong className="text-stone-800">
                          Price:
                        </strong>{" "}
                        ৳
                        {Number(appointment.servicePrice).toLocaleString(
                          "en-BD"
                        )}
                      </p>

                      {appointment.message && (
                        <p>
                          <strong className="text-stone-800">
                            Customer message:
                          </strong>{" "}
                          {appointment.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">
                        Appointment:
                      </span>
                      <StatusBadge status={appointment.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">
                        Payment:
                      </span>
                      <StatusBadge status={appointment.paymentStatus} />
                    </div>
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-100 pt-5">
                    <button
                      onClick={() =>
                        updateStatus(appointment._id, "confirmed")
                      }
                      disabled={updatingId === appointment._id}
                      className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
                    >
                      {updatingId === appointment._id
                        ? "Updating..."
                        : "Confirm"}
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(appointment._id, "cancelled")
                      }
                      disabled={updatingId === appointment._id}
                      className="rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
