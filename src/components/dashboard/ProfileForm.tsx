
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type ProfileFormProps = {
  initialName: string;
  initialImage: string;
  initialPhoneNumber: string;
};

export default function ProfileForm({
  initialName,
  initialImage,
  initialPhoneNumber,
}: ProfileFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, WEBP, or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be 3 MB or less.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await authenticatedApiFetch(
        "/api/uploads/image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!result?.data?.url) {
        throw new Error("Image upload failed. Please try again.");
      }

      setImage(result.data.url);
      setMessage("Image uploaded successfully. Save your profile to apply it.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not upload image. Please try again."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (phoneNumber.trim().length > 20) {
      setError("Phone number must be 20 characters or fewer.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
        phoneNumber: phoneNumber.trim(),
      });

      if (result.error) {
        setError(result.error.message || "Could not update your profile.");
        return;
      }

      setMessage("Your profile has been updated successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <h3 className="text-lg font-bold text-stone-900">
        Edit Profile
      </h3>

      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="profile-name"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Full Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div>
        <label
          htmlFor="profile-phone"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Phone Number
        </label>
        <input
          id="profile-phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={20}
          placeholder="+8801XXXXXXXXX"
          className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div>
        <label
          htmlFor="profile-image-file"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Upload Profile Image
        </label>

        <input
          id="profile-image-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageUpload}
          disabled={uploading || loading}
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:font-semibold file:text-rose-700"
        />

        <p className="mt-1 text-xs text-stone-500">
          JPG, PNG, WEBP, or GIF. Maximum size: 3 MB.
        </p>

        {uploading && (
          <p className="mt-2 text-sm text-rose-600">
            Uploading image...
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="profile-image"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Or Enter Profile Image URL
        </label>
        <input
          id="profile-image"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {image && (
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">
            Image Preview
          </p>
          <img
            src={image}
            alt="Profile preview"
            className="h-20 w-20 rounded-full border border-stone-200 object-cover"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading}
        className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
