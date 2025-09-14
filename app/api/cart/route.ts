import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path to your auth config
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, qty = 1 } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "ProductId is required" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure cart exists
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let updatedItem;
    if (existingItem) {
      // Increment qty
      updatedItem = await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { qty: existingItem.qty + qty },
      });
    } else {
      // Create new cart item
      updatedItem = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, qty },
      });
    }

    return NextResponse.json({ success: true, cartItem: updatedItem });
  } catch (err: any) {
    console.error("Cart error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch cart with items and product details
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    // If no cart yet, return empty
    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Compute total
    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.qty;
    }, 0);

    return NextResponse.json({
      ...cart,
      total,
    });
  } catch (err) {
    console.error("Cart fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
