"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface Service {
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

interface ServiceForm {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  status: "active" | "inactive";
}

const initialForm: ServiceForm = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  duration: "",
  image: "",
  status: "active",
};

export default function ManageServicesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">(
    "success"
  );

  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(
    null
  );

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);

      const result = (await authenticatedApiFetch(
        "/api/services/admin"
      )) as { data?: Service[] };

      setServices(result.data ?? []);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not load services."
      );
      setNoticeType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const user = session.user as typeof session.user & {
      role?: string;
    };

    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    void loadServices();
  }, [session, isPending, router, loadServices]);

  function showNotice(message: string, type: "success" | "error") {
    setNotice(message);
    setNoticeType(type);
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleFormChange(field: keyof ServiceForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleServiceImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      showNotice(
        "Please select a JPG, PNG, WEBP, or GIF image.",
        "error"
      );
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showNotice("Image size must be 3 MB or less.", "error");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setNotice("");

      const formData = new FormData();
      formData.append("image", file);

      const result = (await authenticatedApiFetch(
        "/api/uploads/image",
        {
          method: "POST",
          body: formData,
        }
      )) as {
        data?: {
          url?: string;
        };
      };

      if (!result?.data?.url) {
        throw new Error("Image upload failed. Please try again.");
      }

      handleFormChange("image", result.data.url);

      showNotice(
        "Image uploaded successfully. Save the service to apply it.",
        "success"
      );
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Could not upload image.",
        "error"
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function handleEdit(service: Service) {
    setEditingId(service._id);

    setForm({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      image: service.image,
      status: service.status,
    });

    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.serviceName.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.price ||
      !form.duration ||
      !form.image.trim()
    ) {
      showNotice("Please complete all fields.", "error");
      return;
    }

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!Number.isFinite(price) || price <= 0) {
      showNotice("Enter a valid service price.", "error");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      showNotice("Duration must be a positive whole number.", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        serviceName: form.serviceName.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        duration,
        image: form.image.trim(),
        status: form.status,
      };

      if (editingId) {
        await authenticatedApiFetch(`/api/services/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        showNotice("Service updated successfully.", "success");
      } else {
        await authenticatedApiFetch("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showNotice("New service added successfully.", "success");
      }

      resetForm();
      await loadServices();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Something went wrong.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(service: Service) {
    try {
      if (service.status === "active") {
        const confirmed = window.confirm(
          `Deactivate ${service.serviceName}?`
        );

        if (!confirmed) return;

        await authenticatedApiFetch(`/api/services/${service._id}`, {
          method: "DELETE",
        });

        showNotice("Service deactivated successfully.", "success");
      } else {
        await authenticatedApiFetch(`/api/services/${service._id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "active" }),
        });

        showNotice("Service activated successfully.", "success");
      }

      setConfirmDeactivate(null);
      await loadServices();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Could not update service.",
        "error"
      );
    }
  }

  if (isPending || (loading && !session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="font-medium text-stone-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const user = session?.user as
    | {
        role?: string;
        name?: string;
        email?: string;
      }
    | undefined;

  if (!session || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-600">
          Checking administrator access...
        </p>
      </div>
    );
  }

  const activeCount = services.filter(
    (service) => service.status === "active"
  ).length;

  const inactiveCount = services.length - activeCount;

  return (
    <div className="min-h-screen bg-stone-50 md:flex">
      <DashboardSidebar role="admin" />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-stone-900">
              Manage Services
            </h1>

            <p className="mt-2 text-stone-600">
              Add, update, activate, and deactivate salon services.
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">Total Services</p>
              <p className="mt-2 text-3xl font-bold text-stone-900">
                {services.length}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">Active Services</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {activeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">Inactive Services</p>
              <p className="mt-2 text-3xl font-bold text-stone-500">
                {inactiveCount}
              </p>
            </div>
          </div>

          {/* Notification */}
          {notice && (
            <div
              role="status"
              className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
                noticeType === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {notice}

              <button
                type="button"
                onClick={() => setNotice("")}
                className="float-right font-bold"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          <section className="mb-10 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {editingId ? "Update Service" : "Add New Service"}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {editingId
                    ? "Edit the selected service information."
                    : "Enter the information for your new salon service."}
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Service Name
                  </label>

                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.serviceName}
                    onChange={(e) =>
                      handleFormChange("serviceName", e.target.value)
                    }
                    placeholder="e.g. Haircut & Styling"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Category
                  </label>

                  <input
                    required
                    minLength={2}
                    maxLength={60}
                    value={form.category}
                    onChange={(e) =>
                      handleFormChange("category", e.target.value)
                    }
                    placeholder="e.g. Hair, Skin, Spa"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Price (BDT)
                  </label>

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      handleFormChange("price", e.target.value)
                    }
                    placeholder="e.g. 1200"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Duration (minutes)
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.duration}
                    onChange={(e) =>
                      handleFormChange("duration", e.target.value)
                    }
                    placeholder="e.g. 45"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              {/* Service Image */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Upload Service Image
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleServiceImageUpload}
                    disabled={uploadingImage || saving}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:font-semibold file:text-rose-700"
                  />

                  <p className="mt-1 text-xs text-stone-500">
                    JPG, PNG, WEBP, or GIF. Maximum size: 3 MB.
                  </p>

                  {uploadingImage && (
                    <p className="mt-2 text-sm text-rose-600">
                      Uploading image...
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Or Enter Image URL
                  </label>

                  <input
                    required
                    type="url"
                    value={form.image}
                    onChange={(e) =>
                      handleFormChange("image", e.target.value)
                    }
                    placeholder="https://example.com/service-image.jpg"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                {form.image && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-stone-700">
                      Image Preview
                    </p>

                    <img
                      src={form.image}
                      alt="Service image preview"
                      className="h-32 w-32 rounded-xl border border-stone-200 object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Description
                </label>

                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="Describe the salon service..."
                  className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Service Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    handleFormChange(
                      "status",
                      e.target.value as "active" | "inactive"
                    )
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-rose-600 sm:max-w-xs"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="rounded-full bg-rose-700 px-7 py-3 font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingImage
                  ? "Uploading Image..."
                  : saving
                    ? "Saving..."
                    : editingId
                      ? "Update Service"
                      : "Add Service"}
              </button>
            </form>
          </section>

          {/* Service List */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  All Services
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Manage your existing salon services.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadServices()}
                disabled={loading}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center text-stone-500">
                Loading services...
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
                <p className="font-semibold text-stone-800">
                  No services found.
                </p>

                <p className="mt-2 text-sm text-stone-500">
                  Add your first salon service using the form above.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <article
                    key={service._id}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                  >
                    <div className="h-48 bg-stone-100">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.serviceName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-stone-400">
                          No image available
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                            {service.category}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-stone-900">
                            {service.serviceName}
                          </h3>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            service.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>

                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-stone-600">
                        {service.description}
                      </p>

                      <div className="mt-4 flex justify-between border-t border-stone-100 pt-4">
                        <div>
                          <p className="text-xs text-stone-500">Price</p>

                          <p className="font-bold text-rose-700">
                            ৳{Number(service.price).toLocaleString("en-BD")}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-stone-500">
                            Duration
                          </p>

                          <p className="font-semibold text-stone-800">
                            {service.duration} minutes
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(service)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleStatusChange(service)}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                            service.status === "active"
                              ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {service.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}