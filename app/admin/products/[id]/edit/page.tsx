// app/admin/products/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditProductForm } from "@/components/admin/EditProductForm";

interface PageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true,
    },
  });

  if (!product) return notFound();

  // ✅ Convert Prisma Decimal → number
  const safeProduct = {
    ...product,
    price: product.price.toNumber(),
    images: product.images.map((img) => ({ url: img.url })), // ✅ match form prop type
    categoryId: product.categoryId ?? null,
  };

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-950">Edit Product</h1>
      <EditProductForm product={safeProduct} categories={categories} />
    </div>
  );
}
