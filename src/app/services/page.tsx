import { Suspense } from "react";
import ServicesBrowser from "@/components/services/ServicesBrowser";

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          Loading services...
        </div>
      }
    >
      <ServicesBrowser />
    </Suspense>
  );
}