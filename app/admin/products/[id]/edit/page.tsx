import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        category: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Convert Decimal to number for client component serialization
  const serializableProduct = {
    ...product,
    price: product.price.toNumber(), // Convert Decimal to number
  };

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-black font-bold tracking-tight">
          Edit Product
        </h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <ProductForm product={serializableProduct} categories={categories} />
      </div>
    </div>
  );
}
