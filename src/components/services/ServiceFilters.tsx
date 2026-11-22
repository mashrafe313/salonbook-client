"use client";

interface ServiceFiltersProps {
  search: string;
  category: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const categories = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
];

export default function ServiceFilters({
  search,
  category,
  sort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: ServiceFiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 md:grid-cols-3">
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search services..."
        className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600"
      />

      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600"
      >
        <option value="">All Categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600"
      >
        <option value="">Default Sorting</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}