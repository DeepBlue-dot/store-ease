import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImages, isCloudinaryUrl } from "@/lib/cloudinary";

interface Params {
  params: { id: string };
}

// DELETE /api/products/[id] - Delete product with Cloudinary cleanup
export async function DELETE(request: Request, { params }: Params) {
  try {
    let cloudinaryImageUrls: string[] = [];

    // Use transaction for database operations
    await prisma.$transaction(async (tx) => {
      // 1. Get product with images
      const product = await tx.product.findUnique({
        where: { id: params.id },
        include: { images: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // 2. Identify Cloudinary URLs for later cleanup
      cloudinaryImageUrls = product.images
        .map(img => img.url)
        .filter(url => isCloudinaryUrl(url));

      // 3. Delete ALL images from database (regardless of source)
      await tx.productImage.deleteMany({
        where: { productId: params.id },
      });

      // 4. Delete the product
      await tx.product.delete({
        where: { id: params.id },
      });

      return product;
    });

    // 5. AFTER successful database deletion, cleanup Cloudinary storage
    if (cloudinaryImageUrls.length > 0) {
      try {
        await deleteImages(cloudinaryImageUrls);
        console.log(`✅ Cleaned up ${cloudinaryImageUrls.length} Cloudinary images`);
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary cleanup failed (non-critical):", cloudinaryError);
        // Database operation already succeeded, so we don't fail the request
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Product and all associated data deleted successfully",
      details: {
        cloudinaryImagesCleaned: cloudinaryImageUrls.length
      }
    });

  } catch (error) {
    console.error("❌ Delete product error:", error);
    
    if (error instanceof Error && error.message === "Product not found") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}