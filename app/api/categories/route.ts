import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uploadImage } from "@/lib/cloudinary";
import { Prisma } from "@/lib/generated/prisma"; 

const categorySchema = z.object({ name: z.string().min(1).max(100), imageUrl: z.string().url().optional(), });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const image = formData.get("image") as File | null;

    // Validate fields (without image at first)
    const parsed = categorySchema
      .omit({ imageUrl: true }) // we’ll handle file manually
      .safeParse({ name });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined = undefined;

    // ✅ Handle Cloudinary upload
    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      imageUrl = await uploadImage(buffer, "storeease/categories");
    }

    const category = await prisma.category.create({
      data: {
        ...parsed.data,
        imageUrl,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/categories failed:", err);

    if (err.code === "P2002") {
      // Prisma unique constraint error
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}



const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  search: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  select: z
    .string()
    .optional()
    .transform((val) => val?.split(",").map((f) => f.trim())),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});


export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());

  const parsed = querySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    page = 1,
    limit = 10,
    search,
    createdFrom,
    createdTo,
    select,
    sortBy = "createdAt",
    order = "desc",
  } = parsed.data;

  const skip = (page - 1) * limit;

  // ✅ Filters
  const where: Prisma.CategoryWhereInput = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom && !isNaN(Date.parse(createdFrom))) {
      where.createdAt.gte = new Date(createdFrom);
    }
    if (createdTo && !isNaN(Date.parse(createdTo))) {
      where.createdAt.lte = new Date(createdTo);
    }
  }

  // ✅ Secure default fields
  const safeFields = {
    id: true,
    name: true,
    imageUrl: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { products: true } },
  };

  // ✅ Apply select if provided
  let selectFields: typeof safeFields = safeFields;
  if (select && select.length > 0) {
    selectFields = Object.fromEntries(
      select
        .filter((f) => f in safeFields)
        .map((f) => [f, (safeFields as any)[f]])
    ) as typeof safeFields;

    // Always include id for safe references
    selectFields.id = true;
  }

  try {
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        select: selectFields,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: categories,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
          sortBy,
          order,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/categories failed:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
