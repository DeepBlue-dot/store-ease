import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ Must be a Promise
) {
  const { id } = await context.params // ✅ await the promise
  if (!id) return NextResponse.json({ error: "Missing cart item ID" }, { status: 400 })

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { quantity } = body
  if (typeof quantity !== "number" || quantity < 1)
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true, product: true },
  })
  if (!cartItem) return NextResponse.json({ error: "Cart item not found" }, { status: 404 })

  const cartOwner = await prisma.user.findUnique({ where: { id: cartItem.cart.userId } })
  if (cartOwner?.email !== session.user.email)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const maxQuantity = Math.min(quantity, cartItem.product.stock)
  const updatedItem = await prisma.cartItem.update({
    where: { id },
    data: { qty: maxQuantity },
  })

  return NextResponse.json({ message: "Cart item updated", item: updatedItem })
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ Must be Promise
) {
  const { id } = await context.params
  if (!id) return NextResponse.json({ error: "Missing cart item ID" }, { status: 400 })

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  })
  if (!cartItem) return NextResponse.json({ error: "Cart item not found" }, { status: 404 })

  const cartOwner = await prisma.user.findUnique({ where: { id: cartItem.cart.userId } })
  if (cartOwner?.email !== session.user.email)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.cartItem.delete({ where: { id } })
  return NextResponse.json({ message: "Item removed from cart" })
}
