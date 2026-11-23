
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const instant = false;

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");
  if (session.user.isBlocked) redirect("/sign-in");

  const user = session.user;
  const role = user.role === "admin" ? "admin" : "customer";

  const initials = (user.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-700">
            SalonBook Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            My Profile
          </h1>

          <p className="mt-2 text-stone-600">
            View and manage your account information.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <DashboardSidebar role={role} />

          <section className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center gap-4 border-b border-stone-100 pb-8 sm:flex-row">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Profile"}
                  width={88}
                  height={88}
                  unoptimized
                  className="h-[88px] w-[88px] rounded-full border border-stone-200 object-cover"
                />
              ) : (
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-700">
                  {initials}
                </div>
              )}

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-stone-900">
                  {user.name || "User"}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {user.email}
                </p>

                <span className="mt-3 inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold capitalize text-rose-700">
                  {role}
                </span>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-stone-900">
                Account Information
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Full Name
                  </p>
                  <p className="mt-2 font-semibold text-stone-800">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Email Address
                  </p>
                  <p className="mt-2 break-all font-semibold text-stone-800">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Phone Number
                  </p>
                  <p className="mt-2 font-semibold text-stone-800">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Account Role
                  </p>
                  <p className="mt-2 font-semibold capitalize text-stone-800">
                    {role}
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Email Verification
                  </p>
                  <p className="mt-2 font-semibold text-stone-800">
                    {user.emailVerified ? "Verified" : "Not verified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Editing Form */}
            <ProfileForm
              initialName={user.name || ""}
              initialImage={user.image || ""}
              initialPhoneNumber={user.phoneNumber || ""}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
