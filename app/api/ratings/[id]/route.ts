import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

// Zod schemas
const paramsSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

// Centralized error handler
function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

// GET ratings
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    paramsSchema.parse({ id: productId });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [reviews, totalCount, avgRating] = await Promise.all([
      prisma.rating.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: { id: true, rating: true, review: true, createdAt: true, user: { select: { name: true } } },
      }),
      prisma.rating.count({ where: { productId } }),
      prisma.rating.aggregate({ where: { productId }, _avg: { rating: true } }),
    ]);

    return NextResponse.json({
      data: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        averageRating: avgRating._avg.rating || 0,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

// POST rating
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    paramsSchema.parse({ id: productId });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = ratingSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newRating = await prisma.rating.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { rating: body.rating, review: body.review },
      create: { userId: user.id, productId, rating: body.rating, review: body.review },
      include: { user: { select: { name: true } } },
    });

    const agg = await prisma.rating.aggregate({ where: { productId }, _avg: { rating: true } });
    await prisma.product.update({ where: { id: productId }, data: { averageRating: agg._avg.rating || 0 } });

    return NextResponse.json(newRating);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE rating
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    paramsSchema.parse({ id: productId });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.rating.delete({ where: { userId_productId: { userId: user.id, productId } } });

    const agg = await prisma.rating.aggregate({ where: { productId }, _avg: { rating: true } });
    await prisma.product.update({ where: { id: productId }, data: { averageRating: agg._avg.rating || 0 } });

    return NextResponse.json({ message: "Rating deleted" });
  } catch (err) {
    return handleError(err);
  }
}
