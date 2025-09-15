"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  id: string
  productId: string
  name: string
  category: string
  price: number
  quantity: number
  image: string
  description?: string
  stock: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart")
      const items = res.data.items.map((i: any) => ({
        id: i.id,
        productId: i.product.id,
        name: i.product.name,
        category: i.product.category?.name || "General",
        price: i.product.price,
        quantity: i.qty,
        stock: i.product.stock,
        image: i.product.images?.[0]?.url || "/placeholder.svg",
        description: i.product.shortDescription || "",
      }))
      setCartItems(items)
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch cart")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (id: string, newQty: number, stock: number) => {
    if (newQty < 1 || newQty > stock) {
      toast.error(`Quantity must be between 1 and ${stock}`)
      return
    }
    try {
      const item = cartItems.find((i) => i.id === id)
      if (!item) return

      // Optimistic UI
      setCartItems((items) =>
        items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      )

      await axios.post("/api/cart", { productId: item.productId, qty: newQty })
      toast.success("Cart updated")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update cart")
      fetchCart() // rollback
    }
  }

  const removeItem = async (id: string) => {
    try {
      await axios.delete(`/api/cart/${id}`)
      setCartItems((items) => items.filter((i) => i.id !== id))
      toast.success("Item removed")
    } catch (err) {
      console.error(err)
      toast.error("Failed to remove item")
      fetchCart()
    }
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setDiscount(0.1)
      toast.success("10% discount applied")
    } else if (promoCode.toLowerCase() === "welcome20") {
      setDiscount(0.2)
      toast.success("20% discount applied")
    } else {
      setDiscount(0)
      toast.error("Invalid promo code")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * discount
  const tax = (subtotal - discountAmount) * 0.08
  const total = subtotal - discountAmount + tax

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <Link href="/products">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-32 h-32 bg-gray-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <Badge variant="secondary" className="mb-1">{item.category}</Badge>
                        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-bold text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Link href="/shop">
              <Button variant="outline" className="mt-6">Continue Shopping</Button>
            </Link>
          </div>

          <div className="lg:sticky lg:top-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({(discount*100).toFixed(0)}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none"
                    />
                  </div>
                  <Button onClick={applyPromoCode} variant="outline" disabled={!promoCode.trim()}>Apply</Button>
                </div>

                <Button className="w-full mt-4 bg-blue-600 text-white">Proceed to Checkout</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
