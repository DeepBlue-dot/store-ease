import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { z, ZodError } from "zod"

// Zod schemas
const paramsSchema = z.object({
  id: z.string().uuid("Invalid cart item ID"),
})

const updateCartItemSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

// Helper: centralized error response
function handleError(err: unknown) {
  if (err instanceof ZodError) {
    // Use `issues` instead of `errors`
    return NextResponse.json(
      { error: err.issues[0]?.message || "Invalid input" },
      { status: 400 }
    )
  }
  if (err instanceof Error && err.message.includes("P2002")) {
    return NextResponse.json({ error: "Database constraint violation" }, { status: 400 })
  }
  console.error("Unexpected error:", err)
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
}

// Helper: get session or fail
async function getSessionOrFail() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Unauthorized")
  return session.user.email
}

// Helper: fetch and authorize cart item
async function getAuthorizedCartItem(cartItemId: string, userEmail: string) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  })

  if (!cartItem) throw new Error("Cart item not found")

  const cartOwner = await prisma.user.findUnique({ where: { id: cartItem.cart.userId } })
  if (!cartOwner || cartOwner.email !== userEmail) throw new Error("Forbidden")

  return cartItem
}

// DELETE /api/cart/[id]
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    paramsSchema.parse({ id })

    const email = await getSessionOrFail()
    const cartItem = await getAuthorizedCartItem(id, email)

    await prisma.cartItem.delete({ where: { id: cartItem.id } })
    return NextResponse.json({ message: "Item removed from cart" })
  } catch (err) {
    return handleError(err)
  }
}

// PATCH /api/cart/[id]
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    paramsSchema.parse({ id })

    const email = await getSessionOrFail()
    const body = updateCartItemSchema.parse(await req.json())

    const cartItem = await getAuthorizedCartItem(id, email)
    const maxQuantity = Math.min(body.quantity, cartItem.product.stock)

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { qty: maxQuantity },
    })

    return NextResponse.json({ message: "Cart item updated", item: updatedItem })
  } catch (err) {
    return handleError(err)
  }
}
