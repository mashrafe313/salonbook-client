
export interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface ServicesResponse {
  success: boolean;
  data: Service[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get all services
export async function getServices(params: {
  search?: string;
  category?: string;
  sort?: "price_asc" | "price_desc";
  page?: number;
  limit?: number;
} = {}): Promise<ServicesResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);

  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 12));

  const response = await fetch(
    `${API_URL}/api/services?${query.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Unable to load services (${response.status})`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Unable to load services");
  }

  return result as ServicesResponse;
}

// Get one service by ID
export async function getServiceById(
  id: string
): Promise<Service | null> {
  const response = await fetch(
    `${API_URL}/api/services/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load service (${response.status})`);
  }

  const result = (await response.json()) as ServiceResponse;

  if (!result.success) {
    throw new Error(result.message || "Unable to load service");
  }

  return result.data;
}
