// Custom Hook - Cart State Management
// Uses React context for client-side cart state

"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { CartItem, Product } from "@/lib/types/models"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  subtotal: number
  tax: number
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const TAX_RATE = 0.1

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.productId === product.productId)

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        updated[existingIndex].subtotal = updated[existingIndex].quantity * product.price
        return updated
      }

      return [
        ...prev,
        {
          product,
          quantity,
          subtotal: quantity * product.price,
          discount: 0,
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.productId !== productId)
      }

      return prev.map((item) =>
        item.product.productId === productId ? { ...item, quantity, subtotal: quantity * item.product.price } : item,
      )
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        tax,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
