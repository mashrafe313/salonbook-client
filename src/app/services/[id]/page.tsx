
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/services";
import AppointmentBookingForm from "@/components/services/AppointmentBookingForm";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/services"
          className="mb-8 inline-block font-semibold text-rose-700 hover:text-rose-900"
        >
          ← Back to Services
        </Link>

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
          <div className="relative min-h-[320px] bg-stone-100 md:min-h-[500px]">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.serviceName}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400">
                No image available
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="font-semibold uppercase tracking-widest text-rose-700">
              {service.category}
            </p>

            <h1 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">
              {service.serviceName}
            </h1>

            <p className="mt-6 leading-8 text-stone-600">
              {service.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-rose-50 p-5">
                <p className="text-sm text-stone-600">Price</p>
                <p className="mt-2 text-2xl font-bold text-rose-700">
                  ৳{service.price.toLocaleString("en-BD")}
                </p>
              </div>

              <div className="rounded-xl bg-stone-100 p-5">
                <p className="text-sm text-stone-600">Duration</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">
                  {service.duration} minutes
                </p>
              </div>
            </div>

            <Link
              href="/services"
              className="mt-8 rounded-full bg-rose-700 px-7 py-4 text-center font-semibold text-white transition hover:bg-rose-800"
            >
              Explore More Services
            </Link>
          </div>
        </div>

        <AppointmentBookingForm
          serviceId={service._id}
          serviceStatus={service.status}
        />
      </div>
    </main>
  );
}
