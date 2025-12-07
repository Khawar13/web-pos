// Product Repository - Specific data access for products
// Reengineered from Inventory.java with Repository Pattern

import { BaseRepository } from "./base-repository"
import type { Product } from "../types/models"

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super("products", "productId")
  }

  async findActive(): Promise<Product[]> {
    return this.find({ isActive: true } as any)
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.find({ category, isActive: true } as any)
  }

  async findRentable(): Promise<Product[]> {
    return this.find({ isRentable: true, isActive: true } as any)
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.findOne({ barcode } as any)
  }

  async findLowStock(threshold = 10): Promise<Product[]> {
    const collection = await this.getCollection()
    return collection.find({ quantity: { $lte: threshold }, isActive: true } as any).toArray() as Promise<Product[]>
  }

  async updateStock(productId: string, quantity: number): Promise<Product | null> {
    const collection = await this.getCollection()
    await collection.updateOne({ productId } as any, { $inc: { quantity }, $set: { updatedAt: new Date() } } as any)
    return this.findById(productId)
  }

  async search(query: string): Promise<Product[]> {
    const collection = await this.getCollection()
    return collection
      .find({
        $or: [{ name: { $regex: query, $options: "i" } }, { barcode: query }, { productId: query }],
        isActive: true,
      } as any)
      .toArray() as Promise<Product[]>
  }
}

export const productRepository = new ProductRepository()
