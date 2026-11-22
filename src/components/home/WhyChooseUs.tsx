const benefits = [
  {
    icon: "✦",
    title: "Professional Services",
    description: "Explore treatments delivered by skilled salon professionals.",
  },
  {
    icon: "♡",
    title: "Easy Booking",
    description: "Find your preferred service and request an appointment online.",
  },
  {
    icon: "✓",
    title: "Convenient Experience",
    description: "Manage your appointments and follow their status in one place.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-semibold uppercase tracking-widest text-rose-700">
            The SalonBook Experience
          </p>
          <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
            Beauty Meets Convenience
          </h2>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-stone-50 p-8 text-center"
            >
              <span className="text-4xl text-rose-700">{benefit.icon}</span>
              <h3 className="mt-5 text-xl font-bold text-stone-900">
                {benefit.title}
              </h3>
              <p className="mt-3 leading-7 text-stone-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}