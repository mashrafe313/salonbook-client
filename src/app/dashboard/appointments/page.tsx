
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

interface Appointment {
  _id: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  servicePrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  message?: string;
  createdAt: string;
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

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
const [payingId, setPayingId] = useState<string | null>(null);
  const user = session?.user as
    | { role?: string; isBlocked?: boolean }
    | undefined;

  const loadAppointments = useCallback(async () => {
    try {
      setError("");

      const result = await authenticatedApiFetch("/api/appointments/my");

      const records = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.appointments)
            ? result.appointments
            : [];

      setAppointments(records as Appointment[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your appointments."
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

    if (user?.role === "admin") {
      router.replace("/dashboard");
      return;
    }

    void loadAppointments();
  }, [isPending, session, user?.role, router, loadAppointments]);

  async function handleCancel(appointmentId: string) {
    setCancellingId(appointmentId);
    setFeedback("");
    setError("");

    try {
      await authenticatedApiFetch(
        `/api/appointments/${appointmentId}/cancel`,
        { method: "PATCH" }
      );

      setFeedback("Appointment cancelled successfully.");
      await loadAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel this appointment."
      );
    } finally {
      setCancellingId(null);
    }
  }

 
async function handleStripePayment(appointmentId: string) {
  setPayingId(appointmentId);
  setFeedback("");
  setError("");

  try {
    const result = await authenticatedApiFetch(
      "/api/transactions/checkout",
      {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      }
    );

    const checkoutUrl = result?.data?.url;

    if (!checkoutUrl) {
      throw new Error("Unable to create payment checkout.");
    }

    window.location.assign(checkoutUrl);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to start payment."
    );

    setPayingId(null);
  }
}


  if (isPending || isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-stone-50 px-5">
        <p className="text-stone-600">Loading your appointments...</p>
      </main>
    );
  }

  if (!session || user?.role === "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">
            Customer Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            My Appointments
          </h1>
          <p className="mt-2 text-stone-600">
            View and manage your salon appointment requests.
          </p>
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
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-4xl">📅</div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">
              No appointments yet
            </h2>
            <p className="mt-2 text-stone-600">
              Your appointment requests will appear here.
            </p>
            <button
              onClick={() => router.push("/services")}
              className="mt-6 rounded-full bg-rose-700 px-7 py-3 font-semibold text-white transition hover:bg-rose-800"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      {appointment.serviceName}
                    </h2>

                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      <p>
                        <span className="font-semibold text-stone-800">
                          Date:
                        </span>{" "}
                        {formatDate(appointment.appointmentDate)}
                      </p>

                      <p>
                        <span className="font-semibold text-stone-800">
                          Time:
                        </span>{" "}
                        {formatTime(appointment.timeSlot)}
                      </p>

                      <p>
                        <span className="font-semibold text-stone-800">
                          Price:
                        </span>{" "}
                        ৳
                        {Number(appointment.servicePrice).toLocaleString(
                          "en-BD"
                        )}
                      </p>

                      {appointment.message && (
                        <p>
                          <span className="font-semibold text-stone-800">
                            Message:
                          </span>{" "}
                          {appointment.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">
                        Appointment:
                      </span>
                      <StatusBadge status={appointment.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Payment:</span>
                      <StatusBadge status={appointment.paymentStatus} />
                    </div>
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="mt-6 border-t border-stone-100 pt-5">
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      disabled={cancellingId === appointment._id}
                      className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === appointment._id
                        ? "Cancelling..."
                        : "Cancel Appointment"}
                    </button>
                  </div>
                )}

                {appointment.status === "confirmed" &&
  appointment.paymentStatus === "unpaid" && (
    <div className="mt-6 border-t border-stone-100 pt-5">
      <div className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        Demo payment only. No real money will be charged.
      </div>

      <button
        onClick={() => handleStripePayment(appointment._id)}
        disabled={payingId === appointment._id}
        className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {payingId === appointment._id
          ? "Processing..."
          : "Pay Now"}
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
