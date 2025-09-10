import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


interface Params {
  params: { id: string };
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const {id} = await context.params;
    const session = await getServerSession();
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: { take: 1 }, // only first image
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure customer only accesses their own order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const orderStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "CANCELED",
  "FAILED",
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;


export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {id} = await context.params;

    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { status } = parsed.data;

    // Ensure order exists
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

