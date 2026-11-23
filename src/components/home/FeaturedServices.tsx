
import { connection } from "next/server";
import { getServices } from "@/lib/services";
import ServiceCard from "@/components/services/ServiceCard";

export default async function FeaturedServices() {
  // Load featured services at request time, not during prerendering.
  await connection();

  try {
    const result = await getServices({ page: 1, limit: 50 });

    const services = result.data
      .filter((service) => service.status === "active")
      .slice(0, 6);

    return (
      <section id="featured" className="bg-stone-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <p className="font-semibold uppercase tracking-widest text-rose-600">
              Our Services
            </p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900">
              Featured Salon Services
            </h2>
            <p className="mt-3 text-stone-600">
              Discover services designed to help you look and feel your best.
            </p>
          </div>

          {services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-stone-500">
              No featured services are available yet.
            </p>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error("Featured services loading failed:", error);

    return (
      <section className="py-16 text-center">
        <p className="text-stone-600">
          Unable to load featured services. Please try again later.
        </p>
      </section>
    );
  }
}
