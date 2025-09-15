import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // Your NextAuth config
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }){
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userEmail = session.user.email
  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: "Missing cart item ID" }, { status: 400 })
  }

  try {
    // Find the cart item along with the user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Verify the item belongs to the logged-in user
    const cartOwner = await prisma.user.findUnique({
      where: { id: cartItem.cart.userId },
    })

    if (cartOwner?.email !== userEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the cart item
    await prisma.cartItem.delete({ where: { id } })

    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 })
  } catch (err) {
    console.error("Failed to delete cart item:", err)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userEmail = session.user.email
  const { id } = await context.params
  if (!id) return NextResponse.json({ error: "Missing cart item ID" }, { status: 400 })

  const body = await req.json()
  const { quantity } = body

  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true, product: true } })
    if (!cartItem) return NextResponse.json({ error: "Cart item not found" }, { status: 404 })

    const cartOwner = await prisma.user.findUnique({ where: { id: cartItem.cart.userId } })
    if (cartOwner?.email !== userEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Limit quantity to product stock
    const maxQuantity = Math.min(quantity, cartItem.product.stock)

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { qty: maxQuantity },
    })

    return NextResponse.json({ message: "Cart item updated", item: updatedItem })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}