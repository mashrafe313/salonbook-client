
import { Suspense } from "react";

import Hero from "../components/home/Hero";
import FeaturedServices from "../components/home/FeaturedServices";
import ServiceCategories from "../components/home/ServiceCategories";
import WhyChooseUs from "../components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <main>
      <Hero />

      <Suspense
        fallback={
          <section className="bg-stone-50 py-16 text-center">
            <p className="text-stone-600">Loading featured services...</p>
          </section>
        }
      >
        <FeaturedServices />
      </Suspense>

      <ServiceCategories />
      <WhyChooseUs />
    </main>
  );
}
