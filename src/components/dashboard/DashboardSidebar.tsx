
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardSidebarProps = {
  role: "admin" | "customer";
};

const customerLinks = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Appointments", href: "/dashboard/appointments" },
  { label: "My Profile", href: "/dashboard/profile" },
];

const adminLinks = [
  { label: "Overview", href: "/dashboard" },
  { label: "Manage Services", href: "/dashboard/services" },
  {
    label: "Manage Appointments",
    href: "/dashboard/manage-appointments",
  },
  { label: "Manage Users", href: "/dashboard/users" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "My Profile", href: "/dashboard/profile" },
];

export default function DashboardSidebar({
  role,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const links = role === "admin" ? adminLinks : customerLinks;

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:w-64">
      <div className="mb-5 border-b border-stone-100 pb-4">
        <h2 className="text-lg font-bold text-stone-900">
          {role === "admin" ? "Admin Panel" : "My Dashboard"}
        </h2>

        <p className="mt-1 text-xs capitalize text-stone-500">
          {role} account
        </p>
      </div>

      <nav aria-label="Dashboard navigation">
        <ul className="flex flex-col gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                pathname.startsWith(`${link.href}/`));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-rose-50 text-rose-700"
                      : "text-stone-600 hover:bg-stone-50 hover:text-rose-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
