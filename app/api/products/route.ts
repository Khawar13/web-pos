// API Route - Products Controller
// RESTful API endpoint for product operations

import { type NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/services"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const activeOnly = searchParams.get("active") === "true"

    let products

    if (search) {
      products = await productService.searchProducts(search)
    } else if (category) {
      products = await productService.getProductsByCategory(category)
    } else if (activeOnly) {
      products = await productService.getActiveProducts()
    } else {
      products = await productService.getAllProducts()
    }

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const product = await productService.createProduct(body)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
