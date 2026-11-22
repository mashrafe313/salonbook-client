import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-stone-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-900/30" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/images/salon-hero.jpg')" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-24">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">
            Welcome to SalonBook
          </p>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            Your Beauty,
            <span className="block text-rose-300">Our Passion.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-stone-200 sm:text-lg">
            Discover professional salon services, explore your favorite
            treatments, and make every visit a beautiful experience.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/services"
              className="rounded-full bg-rose-700 px-8 py-4 font-semibold text-white transition hover:bg-rose-800"
            >
              Explore Salon Services
            </Link>

            <a
              href="#featured"
              className="rounded-full border border-white/70 px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-stone-900"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}