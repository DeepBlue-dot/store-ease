import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // optional
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: "Invalid pagination values" }, { status: 400 });
    }

    // Build filters
    const where: any = { userId: session.user.id };
    if (status) {
      where.status = status;
    }

    // Count total
    const total = await prisma.order.count({ where });

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: { take: 1 }, // get first image
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

