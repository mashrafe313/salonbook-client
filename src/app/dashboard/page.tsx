
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardStats from "@/components/dashboard/DashboardStats";
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
                ? "Monitor your platform activity and performance."
                : "Keep track of your appointments and booking status."}
            </p>

            <DashboardStats role={role} />
          </section>
        </div>
      </div>
    </main>
  );
}
