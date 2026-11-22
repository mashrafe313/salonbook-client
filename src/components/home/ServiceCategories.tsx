import Link from "next/link";

const categories = [
  { name: "Haircut & Styling", icon: "✂️" },
  { name: "Hair Coloring", icon: "🎨" },
  { name: "Hair Treatment", icon: "💆" },
  { name: "Facial & Skincare", icon: "✨" },
  { name: "Makeup", icon: "💄" },
  { name: "Manicure & Pedicure", icon: "💅" },
  { name: "Spa & Massage", icon: "🧖" },
];

export default function ServiceCategories() {
  return (
    <section className="bg-rose-50 px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-semibold uppercase tracking-widest text-rose-700">
            Explore By Category
          </p>
          <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
            Find Your Perfect Treatment
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/services?category=${encodeURIComponent(category.name)}`}
              className="rounded-2xl border border-rose-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-md"
            >
              <span className="text-4xl">{category.icon}</span>
              <h3 className="mt-4 font-semibold text-stone-800">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}