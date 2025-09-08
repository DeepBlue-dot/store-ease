import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { getPublicIdFromUrl, isCloudinaryUrl } from "@/lib/cloudinary-utils";

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  imageUrl: z.string().url().optional(),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    // Extract fields
    const name = formData.get("name");
    const image = formData.get("image") as File | null;

    // Validate text fields with Zod
    const parsed = categorySchema.partial().safeParse({ name });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Fetch existing category
    const category = await prisma.category.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    let imageUrl = category.imageUrl;

    // ✅ Handle image upload
    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      imageUrl = await uploadImage(buffer, "storeease/categories");

      // Remove old image if Cloudinary hosted
      if (category.imageUrl && isCloudinaryUrl(category.imageUrl)) {
        const publicId = getPublicIdFromUrl(category.imageUrl);
        if (publicId) await deleteImage(publicId);
      }
    }

    // ✅ Update DB
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...parsed.data,
        imageUrl,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/categories/:id failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  // 🔒 Authorization
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    // ✅ Find category first
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // ✅ Delete DB record
    await prisma.category.delete({ where: { id } });

    // ✅ If Cloudinary image exists → delete it
    if (category.imageUrl && isCloudinaryUrl(category.imageUrl)) {
      const publicId = getPublicIdFromUrl(category.imageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    return NextResponse.json(
      { success: true, message: "Category deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/categories/:id failed:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
