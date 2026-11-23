import { authClient } from "./auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function authenticatedApiFetch(
  path: string,
  options: RequestInit = {}
) {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Please sign in to continue.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${data.token}`);

  if (
  options.body &&
  !(options.body instanceof FormData) &&
  !headers.has("Content-Type")
) {
  headers.set("Content-Type", "application/json");
}

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    {
      ...options,
      headers,
    }
  );

  const contentType = response.headers.get("content-type");

  const result = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      result?.message || `API request failed (${response.status})`
    );
  }

  return result;
}
