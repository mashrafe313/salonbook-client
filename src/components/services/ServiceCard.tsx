import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-56 bg-stone-100">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            No image available
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
          {service.category}
        </p>

        <h3 className="mt-2 text-xl font-bold text-stone-900">
          {service.serviceName}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
          {service.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-rose-700">
              ৳{service.price.toLocaleString("en-BD")}
            </p>
            <p className="text-xs text-stone-500">
              {service.duration} minutes
            </p>
          </div>

          <Link
            href={`/services/${service._id}`}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}