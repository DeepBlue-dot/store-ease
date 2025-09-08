import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uploadImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const querySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().int().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1).max(100).default(10)
  ),

  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "DELETED"]).optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .optional(),
  inStock: z.enum(["true", "false"]).optional(),
  select: z
    .string()
    .optional()
    .transform((val) => val?.split(",").map((f) => f.trim())),
  include: z
    .string()
    .optional()
    .transform((val) => val?.split(",").map((f) => f.trim())),
  sortBy: z
    .enum(["name", "price", "stock", "createdAt", "updatedAt", "averageRating"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());

  const parsed = querySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const {
    page,
    limit,
    search,
    status,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    select,
    include,
    sortBy,
    order,
  } = parsed.data;

  // Build filters
  const where: any = {};

  // 🚨 Prevent non-admins from ever seeing DELETED products
  if (!isAdmin) {
    where.status = { not: "DELETED" };
  } else if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  if (inStock) {
    where.stock = inStock === "true" ? { gt: 0 } : 0;
  }

  // Safe default fields
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

  // Handle `select`
  const selectFields =
    select && select.length > 0
      ? Object.fromEntries(
          select
            .filter((f) => Object.keys(safeFields).includes(f))
            .map((f) => [f, true])
        )
      : safeFields;

  // Handle `include`
  const includeOptions: any = {};
  if (include?.includes("category")) {
    includeOptions.category = {
      select: { id: true, name: true, imageUrl: true },
    };
  }
  if (include?.includes("images")) {
    includeOptions.images = {
      select: { id: true, url: true, createdAt: true },
    };
  }

  const skip = (page - 1) * limit;

  const queryOptions: any = {
    where,
    orderBy: { [sortBy]: order },
    skip,
    take: limit,
  };

  if (include?.length) {
    queryOptions.include = includeOptions;
  } else {
    queryOptions.select = selectFields;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany(queryOptions),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortBy,
      order,
    },
  });
}



const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess((val) => Number(val), z.number().positive("Price must be positive")),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock must be 0 or more")),
  categoryId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    // ✅ 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ✅ 2. Parse form data
    const formData = await req.formData();

    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      categoryId: formData.get("categoryId") || undefined,
    };

    // ✅ 3. Validate input
    const parsed = productSchema.parse(data);

    // ✅ 4. Handle images
    const files = formData.getAll("images") as File[];
    let imageUrls: string[] = [];

    if (files.length > 0) {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadImage(buffer, "storeease/products");
        })
      );
      imageUrls = uploads;
    }

    // ✅ 5. Create product in DB
    const product = await prisma.product.create({
      data: {
        ...parsed,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Product creation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
