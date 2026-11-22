"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Browse Services" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-rose-700">
          SalonBook<span className="text-stone-800">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-700 transition hover:text-rose-700"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/sign-in"
            className="rounded-full border border-rose-700 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Get Started
          </Link>
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
          <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
          <Link href="/sign-up" onClick={() => setMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}