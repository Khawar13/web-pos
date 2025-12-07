// Presentation Layer - Product Grid Component

"use client"

import { useProducts } from "@/lib/hooks/use-products"
import { useCart } from "@/lib/hooks/use-cart"
import type { Product } from "@/lib/types/models"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductGridProps {
  category?: string
}

export function ProductGrid({ category }: ProductGridProps) {
  const { products, isLoading, isError } = useProducts(category)
  const { addItem } = useCart()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load products. Please try again.</div>
  }

  if (products.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No products found.</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product: Product) => (
        <ProductCard key={product.productId} product={product} onAdd={addItem} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const isLowStock = product.quantity <= 10
  const isOutOfStock = product.quantity === 0

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-center h-20 bg-muted rounded-md mb-3">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
          <span
            className={`text-xs ${
              isOutOfStock ? "text-destructive" : isLowStock ? "text-amber-500" : "text-muted-foreground"
            }`}
          >
            {product.quantity} in stock
          </span>
        </div>
        <Button className="w-full mt-3" size="sm" onClick={() => onAdd(product)} disabled={isOutOfStock}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardContent>
    </Card>
  )
}
