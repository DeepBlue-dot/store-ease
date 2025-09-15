// app/api/ratings/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // your NextAuth config
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // Get current session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Optional: pagination
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Fetch user's reviews
    const [reviews, totalCount] = await Promise.all([
      prisma.rating.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          product: { select: { id: true, name: true } }, // include product info
        },
      }),
      prisma.rating.count({ where: { userId: user.id } }),
    ])

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt.toISOString(),
      product: r.product,
    }))

    return NextResponse.json({
      data: formattedReviews,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (err) {
    console.error("Failed to fetch user reviews:", err)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
