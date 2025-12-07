// Presentation Layer - Category Navigation

"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { LayoutGrid, Coffee, Utensils, Package, Shirt, Laptop, Pill, Apple } from "lucide-react"

interface CategoryTabsProps {
  selected: string | null
  onSelect: (category: string | null) => void
}

const categories = [
  { id: null, name: "All", icon: LayoutGrid },
  { id: "beverages", name: "Beverages", icon: Coffee },
  { id: "food", name: "Food", icon: Utensils },
  { id: "groceries", name: "Groceries", icon: Apple },
  { id: "clothing", name: "Clothing", icon: Shirt },
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "health", name: "Health", icon: Pill },
  { id: "other", name: "Other", icon: Package },
]

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selected === category.id

          return (
            <Button
              key={category.id || "all"}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onSelect(category.id)}
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
