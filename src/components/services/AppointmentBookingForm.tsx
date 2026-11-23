
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

interface AppointmentBookingFormProps {
  serviceId: string;
  serviceStatus: "active" | "inactive";
}

export default function AppointmentBookingForm({
  serviceId,
  serviceStatus,
}: AppointmentBookingFormProps) {
  const { data: session, isPending } = authClient.useSession();

  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const user = session?.user as { role?: string } | undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!appointmentDate || !timeSlot) {
      setFeedback({
        type: "error",
        message: "Please select an appointment date and time.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await authenticatedApiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          appointmentDate,
          timeSlot,
          message: message.trim(),
        }),
      });

      setFeedback({
        type: "success",
        message: "Your appointment request was submitted successfully!",
      });

      setAppointmentDate("");
      setTimeSlot("");
      setMessage("");
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your appointment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">
          Book an appointment
        </p>
        <h2 className="mt-2 text-2xl font-bold text-stone-900">
          Schedule your visit
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Choose your preferred date and time to request an appointment.
        </p>
      </div>

      {serviceStatus !== "active" ? (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          This service is currently unavailable for booking.
        </p>
      ) : isPending ? (
        <p className="mt-6 text-sm text-stone-500">
          Checking your account...
        </p>
      ) : !session ? (
        <div className="mt-6 rounded-xl bg-rose-50 p-5">
          <p className="text-stone-700">
            Please sign in with a customer account to book this service.
          </p>
          <Link
            href="/sign-in"
            className="mt-4 inline-block rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Sign In
          </Link>
        </div>
      ) : user?.role === "admin" ? (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Admin accounts cannot book appointments as customers.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="appointmentDate"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Appointment date
            </label>
            <input
              id="appointmentDate"
              type="date"
              min={getTodayDate()}
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              required
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <label
              htmlFor="timeSlot"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Preferred time
            </label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(event) => setTimeSlot(event.target.value)}
              required
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
            >
              <option value="">Select a time slot</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-stone-500">
              Your appointment is subject to confirmation.
            </p>
          </div>

          <div>
            <label
              htmlFor="appointmentMessage"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Additional message (optional)
            </label>
            <textarea
              id="appointmentMessage"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell us if you have any special requests..."
              className="w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
            />
            <p className="mt-1 text-right text-xs text-stone-400">
              {message.length}/500
            </p>
          </div>

          {feedback && (
            <p
              role="status"
              className={`rounded-xl p-4 text-sm ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-rose-700 px-7 py-4 font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Request Appointment"}
          </button>
        </form>
      )}
    </section>
  );
}
