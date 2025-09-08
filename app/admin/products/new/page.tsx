import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-black font-bold tracking-tight">
          Add New Product
        </h2>
      </div>

      <div >
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
