import { prisma } from "@/lib/prisma";
import ProductsTable from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: { createdAt: "asc" }, // Ensure consistent order
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert Decimal to number and ensure proper image structure
    const serializableProducts = products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      // Ensure images is always an array of objects with url property
      images: Array.isArray(product.images)
        ? product.images.map((img) => ({
            id: img.id,
            url: img.url,
            productId: img.productId,
            createdAt: img.createdAt,
          }))
        : [],
    }));

    return <ProductsTable products={serializableProducts} />;
  } catch (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="flex-1 space-y-4 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Products</h2>
          <p className="text-red-600">
            Failed to load products. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
