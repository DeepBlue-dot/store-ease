"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, Category, ProductStatus } from "@/lib/generated/prisma/index";

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    status: ProductStatus;
    categoryId: string | null;
    averageRating: number;
    createdAt: Date;
    updatedAt: Date;
    images: { url: string }[];
    category?: Category | null;
  };
  categories: Category[];
  onSuccess?: () => void;
}

// Track images that need to be deleted from Cloudinary
let imagesToDelete: string[] = [];

export function ProductForm({
  product,
  categories,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [finalImages, setFinalImages] = useState<string[]>([]);

  // Initialize with existing product images
  useEffect(() => {
    if (product?.images) {
      const existingUrls = product.images.map((img) => img.url);
      setFinalImages(existingUrls);
    }
  }, [product]);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "",
    categoryId: product?.categoryId || "",
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) return;

    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    handleUpload(validFiles);
  };

  // Upload files to Cloudinary
  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const uploadData = new FormData();
      files.forEach((file) => uploadData.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Add new URLs to final images
      setFinalImages((prev) => [...prev, ...result.urls]);
      setUploadProgress(100);

      // Clean up preview URLs
      setTimeout(() => {
        setPreviewUrls([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload images"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove image from final selection
  const removeImage = (index: number, isPreview: boolean = false) => {
    if (isPreview) {
      // Remove preview image
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove from final images and mark for deletion if it's a Cloudinary image
      const imageToRemove = finalImages[index];
      if (imageToRemove.includes("cloudinary.com")) {
        imagesToDelete.push(imageToRemove);
      }

      setFinalImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Clean up images when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any unused uploaded images
      if (imagesToDelete.length > 0) {
        fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: imagesToDelete }),
        }).catch(console.error);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      // Validate required fields
      if (
        !formData.name ||
        !formData.description ||
        !formData.price ||
        !formData.stock
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate at least one image
      if (finalImages.length === 0) {
        throw new Error("At least one image is required");
      }

      // For updates: compare with original images to see what needs deletion
      if (product) {
        const originalUrls = product.images.map((img) => img.url);
        const imagesToRemove = originalUrls.filter(
          (url) => !finalImages.includes(url)
        );

        if (imagesToRemove.length > 0) {
          // Schedule these for deletion
          imagesToDelete.push(...imagesToRemove);
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: formData.categoryId || null,
          images: finalImages,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      setSuccess(
        product
          ? "Product updated successfully!"
          : "Product created successfully!"
      );

      // Clean up any images marked for deletion
      if (imagesToDelete.length > 0) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: imagesToDelete }),
        });
        imagesToDelete = [];
      }

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Save product error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error and Success messages */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Existing form fields remain the same */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price *
          </label>
          <input
            type="number"
            id="price"
            step="0.01"
            min="0"
            required
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700"
          >
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            required
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700"
          >
            Category *
          </label>
          <select
            id="categoryId"
            required
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description *
          </label>
          <textarea
            id="description"
            rows={4}
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Cloudinary Image Upload Section */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images * ({finalImages.length}/5)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading || isLoading || finalImages.length >= 5}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading || finalImages.length >= 5}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : `Select Images (${5 - finalImages.length} remaining)`}
          </button>

          {/* Image Management */}
          <div className="mt-6">
            {/* Final Selected Images */}
            {finalImages.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Selected Images ({finalImages.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {finalImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </button>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {url.includes("cloudinary.com")
                          ? "Uploaded"
                          : "Existing"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Preview Images (uploading) */}
            {previewUrls.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Uploading... ({previewUrls.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Uploading image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border opacity-70"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            // Clean up any uploaded but unused images
            if (previewUrls.length > 0) {
              const uploadedButNotUsed = finalImages.filter(
                (url) => !product?.images?.some((img) => img.url === url)
              );
              if (uploadedButNotUsed.length > 0) {
                imagesToDelete.push(...uploadedButNotUsed);
              }
            }
            window.history.back();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isUploading || finalImages.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}
