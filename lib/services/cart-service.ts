// Business Logic Layer - Cart Service
// Manages shopping cart state and calculations

import type { CartItem, Product } from "../types/models"

export class CartService {
  private items: CartItem[] = []
  private taxRate = 0.1 // 10% tax

  getItems(): CartItem[] {
    return [...this.items]
  }

  addItem(product: Product, quantity = 1): CartItem[] {
    const existingIndex = this.items.findIndex((item) => item.product.productId === product.productId)

    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += quantity
      this.items[existingIndex].subtotal = this.items[existingIndex].quantity * product.price
    } else {
      this.items.push({
        product,
        quantity,
        subtotal: quantity * product.price,
        discount: 0,
      })
    }

    return this.getItems()
  }

  updateQuantity(productId: string, quantity: number): CartItem[] {
    const index = this.items.findIndex((item) => item.product.productId === productId)

    if (index >= 0) {
      if (quantity <= 0) {
        this.items.splice(index, 1)
      } else {
        this.items[index].quantity = quantity
        this.items[index].subtotal = quantity * this.items[index].product.price
      }
    }

    return this.getItems()
  }

  removeItem(productId: string): CartItem[] {
    this.items = this.items.filter((item) => item.product.productId !== productId)
    return this.getItems()
  }

  applyItemDiscount(productId: string, discountPercent: number): CartItem[] {
    const index = this.items.findIndex((item) => item.product.productId === productId)

    if (index >= 0) {
      const discount = (this.items[index].subtotal * discountPercent) / 100
      this.items[index].discount = discount
    }

    return this.getItems()
  }

  getSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  getTotalDiscount(): number {
    return this.items.reduce((sum, item) => sum + item.discount, 0)
  }

  getTax(): number {
    const taxableAmount = this.getSubtotal() - this.getTotalDiscount()
    return taxableAmount * this.taxRate
  }

  getTotal(): number {
    return this.getSubtotal() - this.getTotalDiscount() + this.getTax()
  }

  clearCart(): void {
    this.items = []
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }
}

// Factory function to create new cart instances
export const createCartService = () => new CartService()
