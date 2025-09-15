// app/api/ratings/[id]/route.ts

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
 context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 }
    );
  }

  try {
    // Parse query params for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch paginated reviews
    const [reviews, totalCount, avgRating] = await Promise.all([
      prisma.rating.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.rating.count({ where: { productId } }),
      prisma.rating.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    }));

    return NextResponse.json({
      data: formattedReviews,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        averageRating: avgRating._avg.rating || 0,
      },
    });
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
 context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rating, review } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Invalid rating value" },
      { status: 400 }
    );
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Upsert rating
    const newRating = await prisma.rating.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { rating, review },
      create: { userId: user.id, productId, rating, review },
      include: { user: { select: { name: true } } },
    });

    // Update product average rating
    const agg = await prisma.rating.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { averageRating: agg._avg.rating || 0 },
    });

    return NextResponse.json(newRating);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id: productId } = params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.rating.delete({
      where: { userId_productId: { userId: user.id, productId } },
    });

    // Recalculate average rating
    const agg = await prisma.rating.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { averageRating: agg._avg.rating || 0 },
    });

    return NextResponse.json({ message: "Rating deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete rating" },
      { status: 500 }
    );
  }
}
