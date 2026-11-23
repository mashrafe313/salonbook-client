
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Browse Services" },
  ];

  const initials = (user?.name || "User")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    setError("");
    setSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(result.error.message || "Unable to sign out.");
        setSigningOut(false);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong while signing out.");
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-rose-700"
        >
          SalonBook<span className="text-stone-800">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-700 hover:text-rose-700"
            >
              {link.label}
            </Link>
          ))}

          {isPending ? (
            <span className="text-sm text-stone-400">Loading...</span>
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                className="flex items-center gap-3 rounded-full border border-stone-200 px-3 py-2 hover:bg-stone-50"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                    {initials}
                  </span>
                )}

                <span className="text-sm font-semibold text-stone-700">
                  {user.name || "My Account"}
                </span>

                <span className="text-xs text-stone-500">▼</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-stone-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-stone-800">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    {signingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full border border-rose-700 px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="rounded-lg border border-stone-300 px-3 py-2 text-stone-800 md:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-stone-200 bg-white px-5 py-5 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-medium text-stone-700"
            >
              {link.label}
            </Link>
          ))}

          {!isPending && (
            user ? (
              <>
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                      {initials}
                    </span>
                  )}

                  <div>
                    <p className="font-semibold text-stone-800">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-stone-700"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  disabled={signingOut}
                  onClick={handleSignOut}
                  className="text-left font-semibold text-rose-700 disabled:opacity-60"
                >
                  {signingOut ? "Signing out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-stone-700"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="font-semibold text-rose-700"
                >
                  Get Started
                </Link>
              </>
            )
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {error && !menuOpen && (
        <p role="alert" className="px-5 pb-2 text-right text-sm text-red-600">
          {error}
        </p>
      )}
    </header>
  );
}
