// Category Repository - Product category data access

import { BaseRepository } from "./base-repository"
import type { Category } from "../types/models"

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super("categories", "categoryId")
  }

  async findActiveCategories(): Promise<Category[]> {
    return this.find({ isActive: true } as any)
  }
}

export const categoryRepository = new CategoryRepository()
