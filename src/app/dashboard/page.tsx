
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.isBlocked) {
    redirect("/sign-in");
  }

  const role = session.user.role === "admin" ? "admin" : "customer";
  const isAdmin = role === "admin";

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-700">
            SalonBook Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            Welcome, {session.user.name || "User"}!
          </h1>

          <p className="mt-2 text-stone-600">
            {isAdmin
              ? "Manage your SalonBook platform."
              : "Manage your appointments and account."}
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <DashboardSidebar role={role} />

          <section className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold text-stone-900">
              {isAdmin ? "Admin Overview" : "Customer Overview"}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {isAdmin
                ? "Your platform management overview will appear here."
                : "Your appointment and booking overview will appear here."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(isAdmin
                ? [
                    "Total Customers",
                    "Active Services",
                    "Appointment Requests",
                  ]
                : [
                    "Total Appointments",
                    "Pending Appointments",
                    "Confirmed Appointments",
                  ]
              ).map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-5"
                >
                  <p className="text-sm font-medium text-stone-600">
                    {item}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-stone-400">
                    —
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    Data integration pending
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
