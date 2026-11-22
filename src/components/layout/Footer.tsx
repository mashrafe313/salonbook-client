import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-2xl font-bold text-white">SalonBook.</h2>
          <p className="mt-4 text-sm leading-7">
            Your beauty, our passion. Discover professional salon services
            and book your next appointment with ease.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/">Home</Link>
            <Link href="/services">Browse Services</Link>
            <Link href="/sign-in">Sign In</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Contact</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p>Email: contact@salonbook.com</p>
            <p>Phone: +880 1XXX-XXXXXX</p>
            <p>Address: Add your salon address</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Opening Hours</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p>Saturday – Thursday</p>
            <p>10:00 AM – 9:00 PM</p>
            <p>Friday: Closed</p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 px-5 py-6 text-center text-sm">
       © 2026 SalonBook. All rights reserved.
      </div>
    </footer>
  );
}