import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
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

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must have at least 1 item"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { items } = parsed.data;

    // Validate products & stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "Invalid product(s)" }, { status: 400 });
    }

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product?.name ?? item.productId}` },
          { status: 400 }
        );
      }
    }

    // Calculate total price
    const totalPrice = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.qty;
    }, 0);

    // Create order + items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalPrice,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              qty: item.qty,
              price: product.price, // snapshot
            };
          }),
        },
      },
      include: { items: true },
    });

    // Reduce stock
    await Promise.all(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        })
      )
    );

    // Optional: clear items from cart
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: session.user.id }, productId: { in: productIds } },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
