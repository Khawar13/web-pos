// Business Logic Layer - Product Service
// Handles all product-related business logic

import type { Product } from "../types/models"
import { productRepository } from "../repositories"
import { eventService } from "./event-service"

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return productRepository.findAll()
  }

  async getActiveProducts(): Promise<Product[]> {
    return productRepository.findActive()
  }

  async getProductById(productId: string): Promise<Product | null> {
    return productRepository.findById(productId)
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    return productRepository.findByBarcode(barcode)
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return productRepository.findByCategory(category)
  }

  async searchProducts(query: string): Promise<Product[]> {
    return productRepository.search(query)
  }

  async createProduct(productData: Omit<Product, "_id" | "productId" | "createdAt" | "updatedAt">): Promise<Product> {
    const product: Product = {
      ...productData,
      productId: `PRD-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await productRepository.create(product as Product & Document)
    eventService.emit("product_added", `Product ${product.name} added`, created)
    return created as unknown as Product
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const updated = await productRepository.update(productId, updates)
    if (updated) {
      eventService.emit("product_updated", `Product ${updated.name} updated`, updated)

      // Check for low stock
      if (updated.quantity <= 10) {
        eventService.emit("low_stock", `Low stock alert: ${updated.name}`, updated)
      }
    }
    return updated as unknown as Product
  }

  async updateStock(productId: string, quantityChange: number): Promise<Product | null> {
    const product = await this.getProductById(productId)
    if (!product) return null

    const newQuantity = product.quantity + quantityChange
    return this.updateProduct(productId, { quantity: Math.max(0, newQuantity) })
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return productRepository.delete(productId)
  }

  async getLowStockProducts(threshold = 10): Promise<Product[]> {
    return productRepository.findLowStock(threshold)
  }
}

export const productService = new ProductService()
