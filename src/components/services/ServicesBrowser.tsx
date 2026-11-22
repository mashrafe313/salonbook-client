"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceFilters from "@/components/services/ServiceFilters";
import { getServices, type Service } from "@/lib/services";

export default function ServicesPage() {
  const searchParams = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const result = await getServices({
          search: search.trim() || undefined,
          category: category || undefined,
          sort: sort
            ? (sort as "price_asc" | "price_desc")
            : undefined,
          page: 1,
          limit: 50,
        });

        if (!controller.signal.aborted) {
          setServices(
            result.data.filter((service) => service.status === "active")
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load services. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(loadServices, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, category, sort]);

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="bg-rose-50 px-5 py-16 text-center">
        <p className="font-semibold uppercase tracking-widest text-rose-700">
          Discover Our Treatments
        </p>

        <h1 className="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl">
          Browse Salon Services
        </h1>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-stone-600">
          Explore our available treatments and find the right service
          for your beauty and wellness needs.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <ServiceFilters
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        <div className="mb-7 mt-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-900">
            Available Services
          </h2>

          {!loading && (
            <p className="text-sm text-stone-500">
              {services.length} services found
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-stone-600">
            Loading services...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center">
            <h3 className="text-xl font-semibold text-stone-800">
              No services found
            </h3>
            <p className="mt-2 text-stone-500">
              Try changing your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}