import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await context.params;

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check ownership
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only PENDING orders can be canceled
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be canceled" },
        { status: 400 }
      );
    }

    // Transaction: restore stock + update order status
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        });
      }

      // Update order status
      return tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELED" },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
