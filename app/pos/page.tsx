// POS Terminal Page - Main Sales Interface

"use client"

import { useState } from "react"
import { CartProvider } from "@/lib/hooks/use-cart"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"
import { CategoryTabs } from "@/components/pos/category-tabs"
import { CheckoutDialog } from "@/components/pos/checkout-dialog"

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  return (
    <CartProvider>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
            <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
          </div>
          <ProductGrid category={selectedCategory || undefined} />
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l p-4">
          <CartPanel onCheckout={() => setShowCheckout(true)} />
        </div>

        <CheckoutDialog open={showCheckout} onClose={() => setShowCheckout(false)} />
      </div>
    </CartProvider>
  )
}
