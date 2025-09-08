import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImages, uploadImage } from "@/lib/cloudinary";
import { isCloudinaryUrl } from "@/lib/cloudinary-utils";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params {
  params: { id: string };
}

const querySchema = z.object({
  select: z
    .string()
    .optional()
    .transform((val) => val?.split(",").map((f) => f.trim())),
  include: z
    .string()
    .optional()
    .transform((val) => val?.split(",").map((f) => f.trim())),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
   const { id } = await context.params;

  const parsed = querySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { select, include } = parsed.data;

  // Safe base fields
  const safeFields = {
    id: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    status: true,
    averageRating: true,
    createdAt: true,
    updatedAt: true,
    categoryId: true,
  };

  const selectFields =
    select && select.length > 0
      ? Object.fromEntries(
          select
            .filter((f) => Object.keys(safeFields).includes(f))
            .map((f) => [f, true])
        )
      : safeFields;

  const includeOptions: any = {};
  if (include?.includes("category")) {
    includeOptions.category = { select: { id: true, name: true, imageUrl: true } };
  }
  if (include?.includes("images")) {
    includeOptions.images = { select: { id: true, url: true, createdAt: true } };
  }
  if (include?.includes("ratings")) {
    includeOptions.ratings = {
      select: {
        id: true,
        rating: true,
        review: true,
        createdAt: true,
        userId: true,
      },
    };
  }

  try {
    let product;

    if (Object.keys(includeOptions).length > 0) {
      // ✅ Prisma expects include-only
      product = await prisma.product.findUnique({
        where: { id },
        include: includeOptions,
      });
    } else {
      // ✅ Prisma expects select-only
      product = await prisma.product.findUnique({
        where: { id },
        select: selectFields,
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



const productUpdateSchema = z.object({
  name: z.preprocess((v) => (v === null ? undefined : v), z.string().min(1).optional()),
  description: z.preprocess((v) => (v === null ? undefined : v), z.string().min(1).optional()),
  price: z.preprocess(
    (val) => (val !== null ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  stock: z.preprocess(
    (val) => (val !== null ? Number(val) : undefined),
    z.number().int().nonnegative().optional()
  ),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "DELETED"]).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  removeImages: z.array(z.string().url()).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Await params
    const { id } = await context.params;

    // 3. Parse form data
    const formData = await req.formData();
    const removeImages = formData.getAll("removeImages").map(String) as string[]; // ✅ strict string[]

    const rawData: any = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      status: formData.get("status"),
      categoryId: formData.get("categoryId") || undefined,
      removeImages, // ✅ normalized string[]
    };

    // 4. Validate input with Zod
    const parsed = productUpdateSchema.parse(rawData);

    // 5. Upload new images
    const files = formData.getAll("images") as File[];
    let newImageUrls: string[] = [];

    if (files.length > 0) {
      newImageUrls = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadImage(buffer, "storeease/products");
        })
      );
    }

    // 6. Clean parsed data (remove undefined + removeImages)
    const { removeImages: _, ...cleanData } = Object.fromEntries(
      Object.entries(parsed).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      )
    );

    // 7. Update product in Prisma
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...cleanData,
        images: {
          deleteMany:
            removeImages.length > 0
              ? { url: { in: removeImages } } // ✅ correct type
              : undefined,
          create: newImageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true, category: true },
    });

    // 8. Delete from Cloudinary after DB update
    if (removeImages.length > 0) {
      await deleteImages(removeImages);
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Product update failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
